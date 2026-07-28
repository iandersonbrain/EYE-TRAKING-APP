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
      points.forEach((point) => {
        const { px, py } = mapPointToContentPixels(point.x, point.y, contentRect);
        const r = radius * (0.5 + point.weight * 0.8);

        const grad = tempCtx.createRadialGradient(px, py, 1, px, py, r);
        // Grayscale gradient representing density
        const alpha = point.weight * 0.8;
        grad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        tempCtx.fillStyle = grad;
        tempCtx.beginPath();
        tempCtx.arc(px, py, r, 0, Math.PI * 2);
        tempCtx.fill();
      });

      // 2. Map grayscale values to thermal color map on main canvas
      const imgData = tempCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha > 0) {
          const intensity = alpha / 255;

          let r = 0;
          let g = 0;
          let b = 0;

          if (intensity < 0.25) {
            const ratio = intensity / 0.25;
            r = 0;
            g = Math.floor(ratio * 255);
            b = 255;
          } else if (intensity < 0.5) {
            const ratio = (intensity - 0.25) / 0.25;
            r = 0;
            g = 255;
            b = Math.floor((1 - ratio) * 255);
          } else if (intensity < 0.75) {
            const ratio = (intensity - 0.5) / 0.25;
            r = Math.floor(ratio * 255);
            g = 255;
            b = 0;
          } else {
            const ratio = (intensity - 0.75) / 0.25;
            r = 255;
            g = Math.floor((1 - ratio) * 255);
            b = 0;
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = Math.floor(intensity * opacity * 255);
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
