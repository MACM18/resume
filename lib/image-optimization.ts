import sharp from "sharp";

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

/**
 * Optimize image: resize and convert to WebP (or specified format)
 * @param buffer Original image buffer
 * @param options Optimization options
 * @returns Optimized image buffer and content type
 */
export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 80,
    format = "webp",
  } = options;

  let pipeline = sharp(buffer);

  // Get metadata to check current dimensions
  const metadata = await pipeline.metadata();

  // Resize if image exceeds max dimensions (maintain aspect ratio)
  if (
    metadata.width &&
    metadata.height &&
    (metadata.width > maxWidth || metadata.height > maxHeight)
  ) {
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to target format
  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "jpeg":
      pipeline = pipeline.jpeg({ quality });
      break;
    case "png":
      pipeline = pipeline.png({ quality });
      break;
  }

  const optimizedBuffer = await pipeline.toBuffer();

  const contentType = `image/${format}`;
  const ext = format;

  return { buffer: optimizedBuffer, contentType, ext };
}

/**
 * Get appropriate image dimensions based on image type
 */
export function getImageDimensions(imageType: string): {
  maxWidth: number;
  maxHeight: number;
} {
  switch (imageType) {
    case "profile":
      return { maxWidth: 800, maxHeight: 800 }; // Profile images (avatars)
    case "background":
      return { maxWidth: 1920, maxHeight: 1080 }; // Background images (full screen)
    case "project":
      return { maxWidth: 1200, maxHeight: 800 }; // Project thumbnails
    case "favicon":
      return { maxWidth: 512, maxHeight: 512 }; // Favicons
    default:
      return { maxWidth: 1920, maxHeight: 1920 }; // Default
  }
}
