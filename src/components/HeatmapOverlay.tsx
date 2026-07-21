/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";

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

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (points.length === 0) return;

    // Create a temporary canvas to draw the radial gradient masks
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 1. Draw grayscale radial masks where brightness represents intensity
    points.forEach((point) => {
      const px = (point.x / 100) * width;
      const py = (point.y / 100) * height;
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

    // Helper to get color based on intensity (alpha channel)
    // 0 = cold (blue/transparent), 255 = hot (red)
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]; // Grayscale alpha acts as intensity

      if (alpha > 0) {
        // Normalize intensity 0 to 1
        const intensity = alpha / 255;

        let r = 0;
        let g = 0;
        let b = 0;

        // Custom high-quality eye-tracking thermal color ramp
        if (intensity < 0.25) {
          // Low: Blue to Cyan
          const ratio = intensity / 0.25;
          r = 0;
          g = Math.floor(ratio * 255);
          b = 255;
        } else if (intensity < 0.5) {
          // Med-Low: Cyan to Green
          const ratio = (intensity - 0.25) / 0.25;
          r = 0;
          g = 255;
          b = Math.floor((1 - ratio) * 255);
        } else if (intensity < 0.75) {
          // Med-High: Green to Yellow
          const ratio = (intensity - 0.5) / 0.25;
          r = Math.floor(ratio * 255);
          g = 255;
          b = 0;
        } else {
          // High: Yellow to Red
          const ratio = (intensity - 0.75) / 0.25;
          r = 255;
          g = Math.floor((1 - ratio) * 255);
          b = 0;
        }

        data[i] = r;     // Red
        data[i + 1] = g; // Green
        data[i + 2] = b; // Blue
        data[i + 3] = Math.floor(intensity * opacity * 255); // Transparency
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [points, opacity, radius]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 rounded-lg"
    />
  );
}
