import { useEffect, useRef, useState } from "react";

import { AttachmentMetadata } from "@/model/helpers-dtos";
import client from "@/utils/client";

const useAttachmentImages = (
  taskId: number,
  attachments: AttachmentMetadata[],
): Map<number, string> => {
  const [imageUrls, setImageUrls] = useState(new Map<number, string>());
  const urlsRef = useRef(new Map<number, string>());

  useEffect(() => {
    const abortController = new AbortController();

    const loadImages = async (): Promise<void> => {
      const newUrls = new Map<number, string>();

      await Promise.allSettled(
        attachments.map(async (attachment) => {
          const existing = urlsRef.current.get(attachment.id);
          if (existing) {
            newUrls.set(attachment.id, existing);
            return;
          }

          try {
            const blob = await client.helpers.downloadAttachment(
              taskId,
              attachment.id,
              abortController.signal,
            );
            if (abortController.signal.aborted) return;
            const url = URL.createObjectURL(blob);
            newUrls.set(attachment.id, url);
          } catch (error) {
            console.error(
              "[attachments] Failed to download attachment",
              attachment.id,
              error,
            );
          }
        }),
      );

      if (!abortController.signal.aborted) {
        for (const [id, url] of urlsRef.current) {
          if (!newUrls.has(id)) {
            URL.revokeObjectURL(url);
          }
        }
        urlsRef.current = newUrls;
        setImageUrls(newUrls);
      }
    };

    void loadImages();

    return (): void => {
      abortController.abort();
    };
  }, [taskId, attachments]);

  useEffect(() => {
    return (): void => {
      for (const url of urlsRef.current.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return imageUrls;
};

export default useAttachmentImages;
