/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { calculateContentRect, mapPointToContentPixels } from "../lib/overlayBounds";

interface HeatmapPoint {
  x: number;      // percentage 0-100
  y: number;      // percentage 0-100
  weight: number; // intensity 0-1
}

interface HeatmapOverlayProps {
  points: HeatmapPoint[];
  opacity?: number;
  radius?: number; // base radius in pixels
  useOpenCvJet?: boolean; // Uses exact OpenCV cv2.COLORMAP_JET mapping formula
  blurRadius?: number; // Emulates cv2.GaussianBlur (21, 21) kernel
}

export default function HeatmapOverlay({ 
  points, 
  opacity = 0.65, 
  radius = 50,
  useOpenCvJet = true,
  blurRadius = 21
}: HeatmapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderHeatmap = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      if (points.length === 0 || width === 0 || height === 0) return;

      // Calculate exact image/video content bounds inside the container
      const contentRect = calculateContentRect(canvas);

      // Create a temporary canvas to draw the radial gradient masks
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Apply Gaussian Blur filter to simulate OpenCV's cv2.GaussianBlur(saliencyMap, (21, 21), 0)
      if (blurRadius > 0) {
        tempCtx.filter = `blur(${Math.min(30, Math.max(5, Math.floor(blurRadius / 2)))}px)`;
      }

      // 1. Draw grayscale radial masks where brightness represents intensity (FineGrained Saliency Accumulation)
      tempCtx.globalCompositeOperation = "lighter";

      points.forEach((point) => {
        const { px, py } = mapPointToContentPixels(point.x, point.y, contentRect);
        const r = radius * (0.6 + point.weight * 0.9);

        const grad = tempCtx.createRadialGradient(px, py, 1, px, py, r);
        // Alpha represents heat accumulation density (up to 1.0)
        const centerAlpha = Math.min(1.0, point.weight * 1.0);
        grad.addColorStop(0, `rgba(0, 0, 0, ${centerAlpha})`);
        grad.addColorStop(0.5, `rgba(0, 0, 0, ${centerAlpha * 0.5})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        tempCtx.fillStyle = grad;
        tempCtx.beginPath();
        tempCtx.arc(px, py, r, 0, Math.PI * 2);
        tempCtx.fill();
      });

      // Reset filter before reading image data
      tempCtx.filter = "none";

      // 2. Map accumulated intensity to OpenCV COLORMAP_JET or Vibrant Thermal Palette
      const imgData = tempCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Helper for OpenCV COLORMAP_JET R, G, B calculation
      const getJetColor = (v: number) => {
        // v is 0.0 to 1.0
        const clamp = (x: number) => Math.min(255, Math.max(0, Math.floor(x * 255)));
        const r = clamp(1.5 - Math.abs(v * 4.0 - 3.0));
        const g = clamp(1.5 - Math.abs(v * 4.0 - 2.0));
        const b = clamp(1.5 - Math.abs(v * 4.0 - 1.0));
        return { r, g, b };
      };

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha > 0) {
          // Normalize intensity (0 to 1)
          const intensity = Math.min(1.0, alpha / 210);

          let r = 0;
          let g = 0;
          let b = 0;

          if (useOpenCvJet) {
            // Precise OpenCV COLORMAP_JET (Blue -> Cyan -> Green -> Yellow -> Red)
            const jet = getJetColor(intensity);
            r = jet.r;
            g = jet.g;
            b = jet.b;
          } else {
            // Standard Thermal Palette
            if (intensity >= 0.8) {
              const ratio = (intensity - 0.8) / 0.2;
              r = 255;
              g = Math.floor((1 - ratio) * 80);
              b = 0;
            } else if (intensity >= 0.55) {
              const ratio = (intensity - 0.55) / 0.25;
              r = 255;
              g = Math.floor(255 - ratio * 175);
              b = 0;
            } else if (intensity >= 0.35) {
              const ratio = (intensity - 0.35) / 0.20;
              r = Math.floor(ratio * 255);
              g = 255;
              b = 0;
            } else if (intensity >= 0.15) {
              const ratio = (intensity - 0.15) / 0.20;
              r = 0;
              g = Math.floor(ratio * 255);
              b = Math.floor((1 - ratio) * 255);
            } else {
              const ratio = intensity / 0.15;
              r = 0;
              g = Math.floor(ratio * 180);
              b = 255;
            }
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          // OpenCV addWeighted emulation (0.4 heatmap opacity on 0.6 image)
          const renderAlpha = Math.min(255, Math.floor((0.30 + intensity * 0.70) * opacity * 255));
          data[i + 3] = renderAlpha;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    renderHeatmap();

    // Listen for window resize, container resize and media load to update bounds precisely
    window.addEventListener("resize", renderHeatmap);

    let ro: ResizeObserver | null = null;
    if (canvas.parentElement) {
      ro = new ResizeObserver(() => {
        renderHeatmap();
      });
      ro.observe(canvas.parentElement);
    }

    const media = canvas.parentElement?.querySelector("img, video");
    if (media) {
      media.addEventListener("load", renderHeatmap);
      media.addEventListener("loadedmetadata", renderHeatmap);
    }

    return () => {
      window.removeEventListener("resize", renderHeatmap);
      ro?.disconnect();
      if (media) {
        media.removeEventListener("load", renderHeatmap);
        media.removeEventListener("loadedmetadata", renderHeatmap);
      }
    };
  }, [points, opacity, radius]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 rounded-lg"
    />
  );
}
