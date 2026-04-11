import { useCallback, useState } from "react";

import usePromise from "@/hooks/usePromise";
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

const useAttachments = (taskId: number): UseAttachmentsResult => {
  const fetched = usePromise(
    (signal) => client.helpers.getAttachments(taskId, signal),
    [taskId],
  );

  const [mutationError, setMutationError] = useState<unknown>();

  const [localEdits, setLocalEdits] = useState<{
    added: AttachmentMetadata[];
    removed: Set<number>;
  }>({ added: [], removed: new Set() });

  const attachments =
    fetched.result
      ?.filter((a) => !localEdits.removed.has(a.id))
      .concat(localEdits.added) ?? [];

  const addUploaded = useCallback((uploaded: AttachmentMetadata[]): void => {
    setLocalEdits((prev) => ({
      ...prev,
      added: [...prev.added, ...uploaded],
    }));
  }, []);

  const removeAttachment = useCallback((attachmentId: number): void => {
    setLocalEdits((prev) => ({
      added: prev.added.filter((a) => a.id !== attachmentId),
      removed: new Set([...prev.removed, attachmentId]),
    }));
  }, []);

  const removeAttachments = useCallback((attachmentIds: number[]): void => {
    const idsToRemove = new Set(attachmentIds);
    setLocalEdits((prev) => ({
      added: prev.added.filter((a) => !idsToRemove.has(a.id)),
      removed: new Set([...prev.removed, ...attachmentIds]),
    }));
  }, []);

  return {
    attachments,
    loading: fetched.pending,
    error: mutationError ?? fetched.error,
    setError: setMutationError,
    addUploaded,
    removeAttachment,
    removeAttachments,
  };
};

export default useAttachments;
