import { useEffect, useMemo, useRef, useState } from "react";

import { AttachmentMetadata } from "@/model/helpers-dtos";
import client from "@/utils/client";

type AttachmentImage = {
  url: string | undefined;
  error: boolean;
};

/**
 * Downloads attachment images as object URLs and manages their lifecycle.
 * Reuses existing URLs when attachments haven't changed, and revokes
 * stale URLs on update or unmount.
 */
const useAttachmentImages = (
  taskId: number,
  attachments: AttachmentMetadata[],
): Map<number, AttachmentImage> => {
  const [images, setImages] = useState(new Map<number, AttachmentImage>());
  const urlsRef = useRef(new Map<number, string>());

  // Stable dependency: only re-run when the set of attachment IDs changes
  const attachmentIds = useMemo(
    () => attachments.map((a) => a.id),
    [attachments],
  );

  useEffect(() => {
    const abortController = new AbortController();
    const currentIds = new Set(attachmentIds);

    const loadImages = async (): Promise<void> => {
      const newUrls = new Map<number, string>();
      const newImages = new Map<number, AttachmentImage>();

      await Promise.allSettled(
        attachmentIds.map(async (id) => {
          // Reuse existing URL if already loaded
          const existing = urlsRef.current.get(id);
          if (existing) {
            newUrls.set(id, existing);
            newImages.set(id, { url: existing, error: false });
            return;
          }

          try {
            const blob = await client.helpers.downloadAttachment(
              taskId,
              id,
              abortController.signal,
            );
            if (abortController.signal.aborted) return;
            const url = URL.createObjectURL(blob);
            newUrls.set(id, url);
            newImages.set(id, { url, error: false });
          } catch {
            if (!abortController.signal.aborted) {
              newImages.set(id, { url: undefined, error: true });
            }
          }
        }),
      );

      if (!abortController.signal.aborted) {
        // Revoke URLs that are no longer needed
        for (const [id, url] of urlsRef.current) {
          if (!newUrls.has(id)) {
            URL.revokeObjectURL(url);
          }
        }
        urlsRef.current = newUrls;
        setImages(newImages);
      }
    };

    void loadImages();

    return (): void => {
      abortController.abort();
      // Revoke URLs for attachments that were removed
      for (const [id, url] of urlsRef.current) {
        if (!currentIds.has(id)) {
          URL.revokeObjectURL(url);
          urlsRef.current.delete(id);
        }
      }
    };
  }, [taskId, attachmentIds]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    return (): void => {
      for (const url of urlsRef.current.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return images;
};

export default useAttachmentImages;
