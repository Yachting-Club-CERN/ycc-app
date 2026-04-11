import client from "./client";
import { UPLOAD_MAX_DIMENSION, UPLOAD_PHOTO_JPEG_QUALITY } from "./constants";

const decodeImage = async (file: File): Promise<ImageBitmap> => {
  try {
    return await createImageBitmap(file);
  } catch {
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

export const processImageForUpload = async (file: File): Promise<Blob> => {
  const img = await decodeImage(file);

  const scale = Math.min(
    1,
    UPLOAD_MAX_DIMENSION / Math.max(img.width, img.height),
  );
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

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

  // Safari fallback: a detached <canvas> element is used for in-memory drawing
  // and JPEG conversion via toBlob()
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

export const toJpegFileName = (originalName: string): string => {
  const dotIndex = originalName.lastIndexOf(".");
  const stem =
    dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName;
  return `${stem}.jpg`;
};
