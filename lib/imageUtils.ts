/**
 * Utility to compress and resize base64 images to prevent memory issues,
 * payload limit errors (413 Payload Too Large on Netlify/Serverless),
 * and slow API requests.
 */
export async function compressBase64Image(base64Str: string, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
  // If it's an SVG or external URL, return as-is
  if (!base64Str || base64Str.startsWith("data:image/svg+xml") || base64Str.startsWith("http")) {
    return base64Str;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Return original string if error occurs during loading
      resolve(base64Str);
    };

    img.src = base64Str;
  });
}
