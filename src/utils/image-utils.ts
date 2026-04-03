import { UPLOAD_MAX_DIMENSION, UPLOAD_PHOTO_JPEG_QUALITY } from "./constants";

/**
 * Validates that the browser can decode the given file as an image.
 * Returns the decoded ImageBitmap on success, throws on failure.
 */
const decodeImage = async (file: File): Promise<ImageBitmap> => {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error(
      "This image format is not supported. Please use JPEG or PNG.",
    );
  }
};

/**
 * Processes an image file for upload:
 * - Validates the image can be decoded
 * - Resizes to max 2000px on the largest dimension
 * - Bakes EXIF rotation into pixel data
 * - Converts to JPEG (quality 0.85)
 *
 * @returns JPEG blob ready for upload
 */
export const processImageForUpload = async (file: File): Promise<Blob> => {
  const img = await decodeImage(file);

  const scale = Math.min(
    1,
    UPLOAD_MAX_DIMENSION / Math.max(img.width, img.height),
  );
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  // Use OffscreenCanvas where available, fall back to regular canvas (Safari)
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to create canvas context");
    }
    ctx.drawImage(img, 0, 0, w, h);
    img.close();
    return await canvas.convertToBlob({
      type: "image/jpeg",
      quality: UPLOAD_PHOTO_JPEG_QUALITY,
    });
  }

  // TODO but is it displayed?! research why and how this works
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create canvas context");
  }
  ctx.drawImage(img, 0, 0, w, h);
  img.close();
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      },
      "image/jpeg",
      UPLOAD_PHOTO_JPEG_QUALITY,
    );
  });
};

/**
 * Derives a `.jpg` filename from the original file name. Strips the original extension and appends `.jpg`.
 */
export const toJpegFileName = (originalName: string): string => {
  const dotIndex = originalName.lastIndexOf(".");
  const stem =
    dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName;
  return `${stem}.jpg`;
};

/**
 * Creates an object URL for a blob. The caller must call `URL.revokeObjectURL()` when the URL is no longer needed.
 */
export const createObjectUrl = (blob: Blob): string =>
  URL.createObjectURL(blob);
