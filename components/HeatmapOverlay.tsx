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
}

export default function HeatmapOverlay({ 
  points, 
  opacity = 0.65, 
  radius = 50 
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

      // 1. Draw grayscale radial masks where brightness represents intensity
      // Using globalCompositeOperation = 'lighter' (or additive blending) for proper heat accumulation
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

      // 2. Map accumulated intensity to a vibrant Thermal Heatmap Palette:
      // High (1.0) -> ROJO INTENSO (#FF0000)
      // High-Mid (0.75) -> NARANJA VIVO (#FF6600)
      // Mid (0.50) -> AMARILLO BRILLANTE (#FFFF00)
      // Low-Mid (0.25) -> VERDE NEÓN (#00FF66)
      // Low (0.05) -> AZUL/CIAN (#0088FF)
      const imgData = tempCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha > 0) {
          // Normalize intensity (0 to 1)
          const intensity = Math.min(1.0, alpha / 220); // Scale so intense spots reach 1.0 easily

          let r = 0;
          let g = 0;
          let b = 0;

          if (intensity >= 0.8) {
            // 0.8 - 1.0: ROJO INTENSO A ROJO PURO
            const ratio = (intensity - 0.8) / 0.2;
            r = 255;
            g = Math.floor((1 - ratio) * 80); // 80 -> 0 (Pure Red)
            b = 0;
          } else if (intensity >= 0.55) {
            // 0.55 - 0.8: NARANJA A ROJO-NARANJA
            const ratio = (intensity - 0.55) / 0.25;
            r = 255;
            g = Math.floor(255 - ratio * 175); // 255 (Yellow) -> 80 (Orange-Red)
            b = 0;
          } else if (intensity >= 0.35) {
            // 0.35 - 0.55: VERDE-AMARILLO A AMARILLO
            const ratio = (intensity - 0.35) / 0.20;
            r = Math.floor(ratio * 255);
            g = 255;
            b = 0;
          } else if (intensity >= 0.15) {
            // 0.15 - 0.35: AZUL-VERDE A VERDE
            const ratio = (intensity - 0.15) / 0.20;
            r = 0;
            g = Math.floor(ratio * 255);
            b = Math.floor((1 - ratio) * 255);
          } else {
            // 0.0 - 0.15: AZUL SUAVE / CIAN
            const ratio = intensity / 0.15;
            r = 0;
            g = Math.floor(ratio * 180);
            b = 255;
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          // Apply custom user opacity boosted slightly at high heat areas
          const renderAlpha = Math.min(255, Math.floor((0.35 + intensity * 0.65) * opacity * 255));
          data[i + 3] = renderAlpha;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    renderHeatmap();

    // Listen for window resize and media load to update bounds precisely
    window.addEventListener("resize", renderHeatmap);
    const media = canvas.parentElement?.querySelector("img, video");
    if (media) {
      media.addEventListener("load", renderHeatmap);
      media.addEventListener("loadedmetadata", renderHeatmap);
    }

    return () => {
      window.removeEventListener("resize", renderHeatmap);
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
