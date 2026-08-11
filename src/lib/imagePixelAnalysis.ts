import { computeIttiKochNieburSaliency, SaliencyPeak, SaliencyResult } from "./saliency/ittiKochNiebur";

/**
 * Lightweight, fully client-side pixel analysis used to ground the local
 * predictive-attention heuristics in the ACTUAL content of each image,
 * instead of only a hash of its file name/category.
 *
 * This is NOT a substitute for the real Gemini Vision analysis in
 * server.ts (which understands semantic content: real headline text,
 * real object/face detection, real OCR). It combines two real, local
 * signals so the offline/fallback path never depends only on a filename:
 *
 *   1. A classical bottom-up saliency map (Itti-Koch-Niebur, 1998) — see
 *      ./saliency/ittiKochNiebur.ts — which finds the regions of the
 *      image that stand out by multiscale color/intensity/orientation
 *      contrast, the same signal used to predict where human gaze lands
 *      before any semantic understanding of the scene.
 *   2. A simple 3x3 grid of measured brightness/contrast/edge-density,
 *      used for secondary heuristics like finding a "quiet" corner for
 *      logo placement.
 *
 * Approach: downsample the image onto a small canvas, then compute, per
 * cell of a 3x3 grid over the image:
 *   - average luminance (brightness)
 *   - average saturation
 *   - local contrast (std. dev. of luminance)
 *   - edge density (simple gradient magnitude)
 * These are real, measured properties of the specific pixels of that
 * specific image.
 */

export interface GridCell {
  row: number; // 0,1,2 (top,mid,bottom)
  col: number; // 0,1,2 (left,mid,right)
  brightness: number; // 0-255
  saturation: number; // 0-1
  contrast: number; // 0-255 (std dev of luminance within the cell)
  edgeDensity: number; // 0-1 normalized
  centerXPct: number; // 0-100, horizontal center of the cell as % of image width
  centerYPct: number; // 0-100, vertical center of the cell as % of image height
}

export interface ImagePixelFeatures {
  width: number;
  height: number;
  cells: GridCell[]; // 9 cells, row-major
  globalContrast: number; // 0-255
  globalEdgeDensity: number; // 0-1
  dominantColor: { r: number; g: number; b: number };
  colorfulness: number; // 0-1, rough estimate of color variety/saturation spread
  salientCell: GridCell; // cell with the strongest combined contrast+edge signal
  quietCorner: GridCell; // flattest corner cell (good logo/whitespace candidate)
  brightestTopCell: GridCell; // brightest cell in the top row (headline candidate)
  strongestBottomCell: GridCell; // highest-contrast cell in the bottom row (CTA candidate)
  /** Real Itti-Koch-Niebur bottom-up saliency map + ranked peaks (see ./saliency/ittiKochNiebur.ts). */
  saliency: SaliencyResult;
  /** Strongest saliency peak overall — best available "hero" / primary-attention candidate. */
  topSaliencyPeak: SaliencyPeak | null;
  /** Strongest saliency peak located in the upper ~40% of the image — headline candidate. */
  topAreaSaliencyPeak: SaliencyPeak | null;
  /** Strongest saliency peak located in the lower ~35% of the image — CTA candidate. */
  bottomAreaSaliencyPeak: SaliencyPeak | null;
}

const SAMPLE_SIZE = 1024; // downsample target — large enough for a full 9-level pyramid (matches the scales the original Itti et al. algorithm expects), so both small sharp details AND large smooth regions (products, faces, big shapes) get properly captured by center-surround contrast

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Analyzes an image (data URL or same-origin/CORS-enabled URL) and returns
 * measured visual features. Returns null if the image can't be decoded or
 * the canvas is CORS-tainted (e.g. a remote URL without permissive CORS
 * headers) — callers should gracefully fall back to the hash-based
 * heuristics in that case.
 */
export async function analyzeImagePixels(imageSrc: string): Promise<ImagePixelFeatures | null> {
  if (!imageSrc || imageSrc.startsWith("data:image/svg+xml")) return null;

  try {
    const img = await loadImage(imageSrc);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return null;

    const aspect = w / h;
    const sw = aspect >= 1 ? SAMPLE_SIZE : Math.max(1, Math.round(SAMPLE_SIZE * aspect));
    const sh = aspect >= 1 ? Math.max(1, Math.round(SAMPLE_SIZE / aspect)) : SAMPLE_SIZE;

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, sw, sh);

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, sw, sh);
    } catch {
      // Canvas got tainted by a cross-origin image without CORS headers.
      return null;
    }

    const { data } = imageData;
    const luminance = new Float32Array(sw * sh);
    const rArr = new Float32Array(sw * sh);
    const gArr = new Float32Array(sw * sh);
    const bArr = new Float32Array(sw * sh);
    const satArr = new Float32Array(sw * sh);

    let rSum = 0, gSum = 0, bSum = 0;

    for (let i = 0; i < sw * sh; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      luminance[i] = lum;
      rArr[i] = r; gArr[i] = g; bArr[i] = b;
      rSum += r; gSum += g; bSum += b;

      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      satArr[i] = max === 0 ? 0 : (max - min) / max;
    }

    const dominantColor = {
      r: Math.round(rSum / (sw * sh)),
      g: Math.round(gSum / (sw * sh)),
      b: Math.round(bSum / (sw * sh))
    };

    // Global contrast = std dev of luminance across the whole image
    const meanLum = luminance.reduce((a, b) => a + b, 0) / luminance.length;
    const variance = luminance.reduce((a, v) => a + (v - meanLum) * (v - meanLum), 0) / luminance.length;
    const globalContrast = Math.sqrt(variance);

    // Simple edge magnitude: |horizontal gradient| + |vertical gradient|
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
    const globalEdgeDensity = Math.min(1, edgeSum / (sw * sh) / 60); // normalized, empirically scaled

    // Build 3x3 grid cell stats
    const cells: GridCell[] = [];
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
            sumLum += luminance[idx];
            sumSat += satArr[idx];
            sumEdge += edgeMap[idx];
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
        const cellContrast = Math.sqrt(sumSq / count);

        cells.push({
          row, col,
          brightness: cellMeanLum,
          saturation: sumSat / count,
          contrast: cellContrast,
          edgeDensity: Math.min(1, (sumEdge / count) / 60),
          centerXPct: ((col + 0.5) / 3) * 100,
          centerYPct: ((row + 0.5) / 3) * 100
        });
      }
    }

    // Salient cell: strongest combined contrast + edge signal (typical of
    // a hero subject, product shot, or headline block).
    const salientCell = cells.reduce((best, c) =>
      (c.contrast * 0.6 + c.edgeDensity * 255 * 0.4) > (best.contrast * 0.6 + best.edgeDensity * 255 * 0.4) ? c : best
    , cells[0]);

    // Quiet corner: flattest of the 4 corner cells (good logo/whitespace candidate)
    const corners = [cells[0], cells[2], cells[6], cells[8]];
    const quietCorner = corners.reduce((best, c) => (c.edgeDensity < best.edgeDensity ? c : best), corners[0]);

    // Brightest cell in the top row -> common headline placement
    const topRow = cells.filter(c => c.row === 0);
    const brightestTopCell = topRow.reduce((best, c) => (c.contrast > best.contrast ? c : best), topRow[0]);

    // Highest-contrast cell in the bottom row -> common CTA placement
    const bottomRow = cells.filter(c => c.row === 2);
    const strongestBottomCell = bottomRow.reduce((best, c) => (c.contrast > best.contrast ? c : best), bottomRow[0]);

    // Rough "colorfulness": spread of saturation across cells (flat brand
    // colors = low, busy/varied imagery = high)
    const satValues = cells.map(c => c.saturation);
    const meanSat = satValues.reduce((a, b) => a + b, 0) / satValues.length;
    const satVar = satValues.reduce((a, v) => a + (v - meanSat) * (v - meanSat), 0) / satValues.length;
    const colorfulness = Math.min(1, Math.sqrt(satVar) * 4 + meanSat * 0.5);

    // Real bottom-up saliency map (Itti-Koch-Niebur) computed on the same
    // downsampled pixel data — this is what actually drives hero/headline/
    // CTA placement now, instead of the coarse 3x3 grid above.
    const saliency = computeIttiKochNieburSaliency(data, sw, sh, 8);

    const topSaliencyPeak = saliency.peaks.length > 0 ? saliency.peaks[0] : null;
    const topAreaSaliencyPeak = saliency.peaks.find(p => p.yPct <= 40) || null;
    const bottomAreaSaliencyPeak = saliency.peaks.find(p => p.yPct >= 65) || null;

    return {
      width: w,
      height: h,
      cells,
      globalContrast,
      globalEdgeDensity,
      dominantColor,
      colorfulness,
      salientCell,
      quietCorner,
      brightestTopCell,
      strongestBottomCell,
      saliency,
      topSaliencyPeak,
      topAreaSaliencyPeak,
      bottomAreaSaliencyPeak
    };
  } catch {
    return null;
  }
}
