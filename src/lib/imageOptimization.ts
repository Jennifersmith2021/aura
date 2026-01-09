/**
 * Image optimization utilities
 */

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: "webp" | "jpeg" | "png";
}

interface OptimizedImage {
  original: string;
  webp: string;
  thumbnail: string;
  dimensions: { width: number; height: number };
  size: number;
}

/**
 * Compress and optimize an image
 */
export async function optimizeImage(
  dataUrl: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = "webp",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Calculate scaled dimensions
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      // Generate webp version
      const webp = canvas.toDataURL("image/webp", quality);

      // Generate thumbnail
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = 200;
      thumbCanvas.height = 200;
      const thumbCtx = thumbCanvas.getContext("2d");
      if (thumbCtx) {
        thumbCtx.drawImage(img, 0, 0, 200, 200);
      }
      const thumbnail = thumbCanvas.toDataURL("image/webp", 0.6);

      resolve({
        original: dataUrl,
        webp,
        thumbnail,
        dimensions: { width, height },
        size: webp.length,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = dataUrl;
  });
}

/**
 * Batch optimize multiple images
 */
export async function batchOptimizeImages(
  dataUrls: string[],
  options?: ImageOptimizationOptions
): Promise<OptimizedImage[]> {
  return Promise.all(dataUrls.map((url) => optimizeImage(url, options)));
}

/**
 * Get image dimensions without loading full image
 */
export function getImageDimensions(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = dataUrl;
  });
}

/**
 * Compress base64 image
 */
export function compressBase64(
  dataUrl: string,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/webp", quality));
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = dataUrl;
  });
}

/**
 * Convert image to specific format
 */
export function convertImageFormat(
  dataUrl: string,
  format: "webp" | "jpeg" | "png" = "webp",
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const mimeType =
        format === "webp"
          ? "image/webp"
          : format === "jpeg"
            ? "image/jpeg"
            : "image/png";

      resolve(canvas.toDataURL(mimeType, quality));
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = dataUrl;
  });
}

/**
 * Create thumbnail from image
 */
export function createThumbnail(
  dataUrl: string,
  size = 200,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Center crop
      const sourceSize = Math.min(img.width, img.height);
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = (img.height - sourceSize) / 2;

      ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      resolve(canvas.toDataURL("image/webp", quality));
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = dataUrl;
  });
}

/**
 * Calculate storage savings from optimization
 */
export function calculateOptimizationStats(
  original: string,
  optimized: string
): {
  originalSize: number;
  optimizedSize: number;
  saved: number;
  savingPercent: number;
} {
  const originalSize = original.length;
  const optimizedSize = optimized.length;
  const saved = originalSize - optimizedSize;
  const savingPercent = (saved / originalSize) * 100;

  return { originalSize, optimizedSize, saved, savingPercent };
}

/**
 * Lazy load images for performance
 */
export function lazyLoadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
