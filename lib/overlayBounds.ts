/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, RefObject } from "react";

export interface ContentRect {
  x: number;      // X offset in container pixels
  y: number;      // Y offset in container pixels
  width: number;  // Content width in container pixels
  height: number; // Content height in container pixels
}

/**
 * Calculates the exact rendered bounding box of an <img> or <video> media element
 * inside its parent container, accounting for letterboxing/pillarboxing (object-fit: contain/cover).
 */
export function calculateContentRect(element: HTMLElement | null): ContentRect {
  if (!element) {
    return { x: 0, y: 0, width: 300, height: 150 };
  }

  const container = element.parentElement;
  if (!container) {
    const rect = element.getBoundingClientRect();
    return { x: 0, y: 0, width: rect.width || 300, height: rect.height || 150 };
  }

  const containerRect = container.getBoundingClientRect();

  // Find media sibling or element itself
  let media: HTMLImageElement | HTMLVideoElement | null = null;
  if (element instanceof HTMLImageElement || element instanceof HTMLVideoElement) {
    media = element;
  } else {
    media = container.querySelector<HTMLImageElement | HTMLVideoElement>("img, video");
  }

  if (!media) {
    return {
      x: 0,
      y: 0,
      width: containerRect.width || 300,
      height: containerRect.height || 150,
    };
  }

  const mediaRect = media.getBoundingClientRect();

  // Get natural dimensions
  let naturalW = 0;
  let naturalH = 0;

  if (media instanceof HTMLImageElement) {
    naturalW = media.naturalWidth;
    naturalH = media.naturalHeight;
  } else if (media instanceof HTMLVideoElement) {
    naturalW = media.videoWidth;
    naturalH = media.videoHeight;
  }

  // If natural size isn't available yet, fallback to rendered bounding box
  if (!naturalW || !naturalH) {
    const x = mediaRect.left - containerRect.left;
    const y = mediaRect.top - containerRect.top;
    return {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: mediaRect.width || containerRect.width,
      height: mediaRect.height || containerRect.height,
    };
  }

  // Get object-fit mode
  const style = window.getComputedStyle(media);
  const objectFit = style.objectFit || "contain";

  const boxW = mediaRect.width;
  const boxH = mediaRect.height;

  let contentW = boxW;
  let contentH = boxH;

  if (objectFit === "contain" || objectFit === "scale-down") {
    const scale = Math.min(boxW / naturalW, boxH / naturalH);
    contentW = naturalW * scale;
    contentH = naturalH * scale;
  } else if (objectFit === "cover") {
    const scale = Math.max(boxW / naturalW, boxH / naturalH);
    contentW = naturalW * scale;
    contentH = naturalH * scale;
  }

  const mediaLeftInContainer = mediaRect.left - containerRect.left;
  const mediaTopInContainer = mediaRect.top - containerRect.top;

  const contentX = mediaLeftInContainer + (boxW - contentW) / 2;
  const contentY = mediaTopInContainer + (boxH - contentH) / 2;

  return {
    x: contentX,
    y: contentY,
    width: contentW,
    height: contentH,
  };
}

/**
 * Maps a normalized percentage point (0-100 x, 0-100 y) to actual pixel coordinates
 * within a container based on the inner content rectangle.
 */
export function mapPointToContentPixels(
  xPct: number,
  yPct: number,
  contentRect: ContentRect
): { px: number; py: number } {
  const px = contentRect.x + (xPct / 100) * contentRect.width;
  const py = contentRect.y + (yPct / 100) * contentRect.height;
  return { px, py };
}

/**
 * React hook that returns the live content bounding rect of media element inside container
 */
export function useContentRect(elementRef: RefObject<HTMLElement | null>): ContentRect {
  const [rect, setRect] = useState<ContentRect>({ x: 0, y: 0, width: 300, height: 150 });

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const update = () => {
      setRect(calculateContentRect(el));
    };

    update();

    window.addEventListener("resize", update);
    const media = el.parentElement?.querySelector("img, video") || el.querySelector("img, video");
    if (media) {
      media.addEventListener("load", update);
      media.addEventListener("loadedmetadata", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (media) {
        media.removeEventListener("load", update);
        media.removeEventListener("loadedmetadata", update);
      }
    };
  }, [elementRef]);

  return rect;
}
