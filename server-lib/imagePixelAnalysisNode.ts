/**
 * Node/server-side counterpart of src/lib/imagePixelAnalysis.ts.
 *
 * The browser version uses <canvas> + Image() to decode pixels, which
 * don't exist in Node. This uses `jimp` (pure JS, no native binaries —
 * safer to deploy than e.g. `sharp` on arbitrary hosts) to decode the
 * image instead, then feeds the raw RGBA pixels into the exact same,
 * shared, pure-math saliency algorithm (src/lib/saliency/ittiKochNiebur.ts)
 * used by the frontend.
 *
 * This is what server.ts's fallback (when GEMINI_API_KEY isn't configured,
 * or a Gemini call fails) uses, so the LOCAL fallback here behaves the
 * same way as the browser's local fallback: grounded in real, measured
 * pixel content instead of only a filename hash.
 */

import { Jimp } from "jimp";
import { computeIttiKochNieburSaliency, SaliencyPeak, SaliencyResult } from "../src/lib/saliency/ittiKochNiebur";

export interface GridCellNode {
  row: number;
  col: number;
  brightness: number;
  saturation: number;
  contrast: number;
  edgeDensity: number;
  centerXPct: number;
  centerYPct: number;
}

export interface ImagePixelFeaturesNode {
  width: number;
  height: number;
  cells: GridCellNode[];
  globalContrast: number;
  globalEdgeDensity: number;
  colorfulness: number;
  saliency: SaliencyResult;
  topSaliencyPeak: SaliencyPeak | null;
  topAreaSaliencyPeak: SaliencyPeak | null;
  bottomAreaSaliencyPeak: SaliencyPeak | null;
  quietCorner: GridCellNode;
  brightestTopCell: GridCellNode;
  strongestBottomCell: GridCellNode;
}

const SAMPLE_SIZE = 1024; // must match src/lib/imagePixelAnalysis.ts — large enough for a full 9-level pyramid so large objects (products, faces) are captured, not just small sharp edges

function stripDataUrlPrefix(input: string): Buffer {
  const b64 = input.includes(",") && input.trim().startsWith("data:") ? input.split(",", 2)[1] : input;
  return Buffer.from(b64, "base64");
}

export async function analyzeImagePixelsNode(imageBase64OrUrl?: string): Promise<ImagePixelFeaturesNode | null> {
  if (!imageBase64OrUrl) return null;
  try {
    let buffer: Buffer;
    if (imageBase64OrUrl.startsWith("http://") || imageBase64OrUrl.startsWith("https://")) {
      const resp = await fetch(imageBase64OrUrl);
      if (!resp.ok) return null;
      buffer = Buffer.from(await resp.arrayBuffer());
    } else if (imageBase64OrUrl.startsWith("data:image/svg+xml")) {
      return null; // vector, not meaningful for pixel/saliency analysis
    } else {
      buffer = stripDataUrlPrefix(imageBase64OrUrl);
    }

    const img = await Jimp.read(buffer);
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    if (!w || !h) return null;

    const aspect = w / h;
    const sw = aspect >= 1 ? SAMPLE_SIZE : Math.max(1, Math.round(SAMPLE_SIZE * aspect));
    const sh = aspect >= 1 ? Math.max(1, Math.round(SAMPLE_SIZE / aspect)) : SAMPLE_SIZE;
    img.resize({ w: sw, h: sh });

    const data = img.bitmap.data; // Uint8Array RGBA, length sw*sh*4

    const luminance = new Float32Array(sw * sh);
    const satArr = new Float32Array(sw * sh);
    for (let i = 0; i < sw * sh; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      luminance[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      satArr[i] = max === 0 ? 0 : (max - min) / max;
    }

    const meanLum = luminance.reduce((a, b) => a + b, 0) / luminance.length;
    const variance = luminance.reduce((a, v) => a + (v - meanLum) * (v - meanLum), 0) / luminance.length;
    const globalContrast = Math.sqrt(variance);

    const edgeMap = new Float32Array(sw * sh);
    let edgeSum = 0;
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const idx = y * sw + x;
        const gx = luminance[idx + 1] - luminance[idx - 1];
        const gy = luminance[idx + sw] - luminance[idx - sw];
        const mag = Math.sqrt(gx * gx + gy * gy);
        edgeMap[idx] = mag;
        edgeSum += mag;
      }
    }
    const globalEdgeDensity = Math.min(1, edgeSum / (sw * sh) / 60);

    const cells: GridCellNode[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x0 = Math.floor((col / 3) * sw);
        const x1 = Math.floor(((col + 1) / 3) * sw);
        const y0 = Math.floor((row / 3) * sh);
        const y1 = Math.floor(((row + 1) / 3) * sh);
        let sumLum = 0, sumSat = 0, sumEdge = 0, count = 0;
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const idx = y * sw + x;
            sumLum += luminance[idx]; sumSat += satArr[idx]; sumEdge += edgeMap[idx];
            count++;
          }
        }
        count = Math.max(1, count);
        const cellMeanLum = sumLum / count;
        let sumSq = 0;
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const idx = y * sw + x;
            sumSq += (luminance[idx] - cellMeanLum) * (luminance[idx] - cellMeanLum);
          }
        }
        cells.push({
          row, col,
          brightness: cellMeanLum,
          saturation: sumSat / count,
          contrast: Math.sqrt(sumSq / count),
          edgeDensity: Math.min(1, (sumEdge / count) / 60),
          centerXPct: ((col + 0.5) / 3) * 100,
          centerYPct: ((row + 0.5) / 3) * 100
        });
      }
    }

    const corners = [cells[0], cells[2], cells[6], cells[8]];
    const quietCorner = corners.reduce((best, c) => (c.edgeDensity < best.edgeDensity ? c : best), corners[0]);
    const topRow = cells.filter(c => c.row === 0);
    const brightestTopCell = topRow.reduce((best, c) => (c.contrast > best.contrast ? c : best), topRow[0]);
    const bottomRow = cells.filter(c => c.row === 2);
    const strongestBottomCell = bottomRow.reduce((best, c) => (c.contrast > best.contrast ? c : best), bottomRow[0]);

    const satValues = cells.map(c => c.saturation);
    const meanSat = satValues.reduce((a, b) => a + b, 0) / satValues.length;
    const satVar = satValues.reduce((a, v) => a + (v - meanSat) * (v - meanSat), 0) / satValues.length;
    const colorfulness = Math.min(1, Math.sqrt(satVar) * 4 + meanSat * 0.5);

    const saliency = computeIttiKochNieburSaliency(data as unknown as Uint8ClampedArray, sw, sh, 8);
    const topSaliencyPeak = saliency.peaks.length > 0 ? saliency.peaks[0] : null;
    const topAreaSaliencyPeak = saliency.peaks.find(p => p.yPct <= 40) || null;
    const bottomAreaSaliencyPeak = saliency.peaks.find(p => p.yPct >= 65) || null;

    return {
      width: w, height: h, cells, globalContrast, globalEdgeDensity, colorfulness,
      saliency, topSaliencyPeak, topAreaSaliencyPeak, bottomAreaSaliencyPeak,
      quietCorner, brightestTopCell, strongestBottomCell
    };
  } catch (e) {
    console.warn("analyzeImagePixelsNode failed:", e);
    return null;
  }
}
