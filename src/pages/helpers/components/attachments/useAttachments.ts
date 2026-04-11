import { useCallback, useEffect, useState } from "react";

import { AttachmentMetadata } from "@/model/helpers-dtos";
import client from "@/utils/client";

type UseAttachmentsResult = {
  attachments: AttachmentMetadata[];
  loading: boolean;
  error: unknown;
  setError: (error: unknown) => void;
  addUploaded: (uploaded: AttachmentMetadata[]) => void;
  removeAttachment: (attachmentId: number) => void;
  removeAttachments: (attachmentIds: number[]) => void;
};

/**
 * Fetches and manages attachment state for a helper task.
 */
const useAttachments = (taskId: number): UseAttachmentsResult => {
  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    const abortController = new AbortController();

    client.helpers
      .getAttachments(taskId, abortController.signal)
      .then((result) => {
        if (!abortController.signal.aborted) {
          setAttachments(result);
        }
      })
      .catch((err: unknown) => {
        if (!abortController.signal.aborted) {
          setError(err);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return (): void => {
      abortController.abort();
    };
  }, [taskId]);

  const addUploaded = useCallback((uploaded: AttachmentMetadata[]): void => {
    setAttachments((prev) =>
      [...prev, ...uploaded].toSorted((a, b) =>
        (a.description ?? "").localeCompare(b.description ?? ""),
      ),
    );
  }, []);

  const removeAttachment = useCallback((attachmentId: number): void => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }, []);

  const removeAttachments = useCallback((attachmentIds: number[]): void => {
    const idSet = new Set(attachmentIds);
    setAttachments((prev) => prev.filter((a) => !idSet.has(a.id)));
  }, []);

  return {
    attachments,
    loading,
    error,
    setError,
    addUploaded,
    removeAttachment,
    removeAttachments,
  };
};

export default useAttachments;
