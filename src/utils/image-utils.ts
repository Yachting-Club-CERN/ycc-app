import client from "./client";
import { UPLOAD_MAX_DIMENSION, UPLOAD_PHOTO_JPEG_QUALITY } from "./constants";

/**
 * Decodes the given file into an ImageBitmap.
 *
 * Fast path: createImageBitmap handles JPEG/PNG/WebP everywhere, and HEIC on
 * Apple browsers (iOS Safari, iPadOS Safari, macOS Safari) via system ImageIO.
 *
 * Fallback path: on browsers without a HEIC decoder (Mac Firefox, Windows Chrome,
 * Android Chrome), createImageBitmap throws. We send the bytes to the BE
 * transcode endpoint, which uses pillow-heif to produce a JPEG, then decode that
 * JPEG locally and return the bitmap. Same downstream pipeline either way.
 */
const decodeImage = async (file: File): Promise<ImageBitmap> => {
  try {
    return await createImageBitmap(file);
  } catch {
    // Browser can't decode this natively. Try server-side transcoding.
    try {
      const jpeg = await client.helpers.transcodeAttachment(file, file.name);
      return await createImageBitmap(jpeg);
    } catch {
      throw new Error(
        "Could not process this image. Please try a different file.",
      );
    }
  }
};

/**
 * Processes an image file for upload:
 * - Decodes via createImageBitmap, falling back to BE transcoding for HEIC on
 *   browsers that can't decode it natively
 * - Resizes to max 2000px on the largest dimension (never upscales)
 * - Bakes EXIF orientation into pixel data
 * - Strips all other EXIF metadata as a side effect of the canvas round-trip
 *   (no GPS, no camera info, no timestamps)
 * - Re-encodes as JPEG at quality 0.85
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
