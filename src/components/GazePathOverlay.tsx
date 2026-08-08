/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { GazePathPoint } from "../types";
import { calculateContentRect, mapPointToContentPixels } from "../lib/overlayBounds";

interface GazePathOverlayProps {
  gazePath: GazePathPoint[];
  hoveredPoint?: string | null;
  onHoverPoint?: (id: string | null) => void;
}

export default function GazePathOverlay({
  gazePath,
  hoveredPoint,
  onHoverPoint,
}: GazePathOverlayProps) {
  const containerRef = useRef<SVGSVGElement | null>(null);
  const [coords, setCoords] = useState<{ id: string; px: number; py: number; sequence: number }[]>([]);

  useEffect(() => {
    const svgEl = containerRef.current;
    if (!svgEl) return;

    const updateCoords = () => {
      const contentRect = calculateContentRect(svgEl);
      const mapped = gazePath.map((p) => {
        const { px, py } = mapPointToContentPixels(p.x, p.y, contentRect);
        return { id: p.id, px, py, sequence: p.sequence };
      });
      setCoords(mapped);
    };

    updateCoords();

    window.addEventListener("resize", updateCoords);

    let ro: ResizeObserver | null = null;
    if (svgEl.parentElement) {
      ro = new ResizeObserver(() => {
        updateCoords();
      });
      ro.observe(svgEl.parentElement);
    }

    const media = svgEl.parentElement?.querySelector("img, video");
    if (media) {
      media.addEventListener("load", updateCoords);
      media.addEventListener("loadedmetadata", updateCoords);
    }

    return () => {
      window.removeEventListener("resize", updateCoords);
      ro?.disconnect();
      if (media) {
        media.removeEventListener("load", updateCoords);
        media.removeEventListener("loadedmetadata", updateCoords);
      }
    };
  }, [gazePath]);

  if (!gazePath || gazePath.length === 0) return null;

  return (
    <svg ref={containerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
      <defs>
        <marker
          id="arrow-head"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 2 L 10 5 L 0 8 z" fill="#f59e0b" />
        </marker>
      </defs>

      {/* Draw connecting lines */}
      {coords.map((point, index) => {
        if (index === 0) return null;
        const prevPoint = coords[index - 1];
        return (
          <line
            key={`line-${index}`}
            x1={prevPoint.px}
            y1={prevPoint.py}
            x2={point.px}
            y2={point.py}
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            markerEnd="url(#arrow-head)"
          />
        );
      })}

      {/* Draw fixation circles */}
      {coords.map((point) => (
        <g key={`gaze-${point.id}`}>
          <circle
            cx={point.px}
            cy={point.py}
            r={hoveredPoint === point.id ? 18 : 14}
            fill="#1e293b"
            stroke="#f59e0b"
            strokeWidth="3"
            className="transition-all duration-200 cursor-pointer pointer-events-auto"
            onMouseEnter={() => onHoverPoint?.(point.id)}
            onMouseLeave={() => onHoverPoint?.(null)}
          />
          <text
            x={point.px}
            y={point.py}
            textAnchor="middle"
            dy=".3em"
            fill="#f59e0b"
            fontSize={hoveredPoint === point.id ? "12" : "10"}
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {point.sequence}
          </text>
        </g>
      ))}
    </svg>
  );
}
