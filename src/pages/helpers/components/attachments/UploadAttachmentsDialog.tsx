import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { useCallback, useEffect, useRef, useState } from "react";

import { AttachmentMetadata } from "@/model/helpers-dtos";
import client from "@/utils/client";
import getErrorText from "@/utils/error-helper";
import { processImageForUpload, toJpegFileName } from "@/utils/image-utils";

import FileEntryRow from "./FileEntryRow";

export type FileEntry = {
  originalFile: File;
  processedBlob: Blob | null;
  processedFileName: string | null;
  previewUrl: string | null;
  description: string;
  status: "preparing" | "pending" | "uploading" | "done" | "error";
  error?: string | undefined;
};

type Props = {
  open: boolean;
  taskId: number;
  files: File[];
  onComplete: (uploaded: AttachmentMetadata[]) => void;
  onClose: () => void;
};

const UploadAttachmentsDialog = ({
  open,
  taskId,
  files,
  onComplete,
  onClose,
}: Props): React.ReactNode => {
  const [entries, setEntries] = useState<FileEntry[]>(() =>
    files.map((file) => ({
      originalFile: file,
      processedBlob: null,
      processedFileName: null,
      previewUrl: null,
      description: "",
      status: "preparing" as const,
    })),
  );
  const [uploading, setUploading] = useState(false);
  const uploadedRef = useRef<AttachmentMetadata[]>([]);
  const previewUrlsRef = useRef<string[]>([]);

  const updateEntry = useCallback(
    (index: number, patch: Partial<FileEntry>): void => {
      setEntries((prev) =>
        prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
      );
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];

    const processFile = async (file: File, index: number): Promise<void> => {
      try {
        const blob = await processImageForUpload(file);
        if (cancelled) return;
        const previewUrl = URL.createObjectURL(blob);
        createdUrls.push(previewUrl);
        previewUrlsRef.current.push(previewUrl);
        updateEntry(index, {
          processedBlob: blob,
          processedFileName: toJpegFileName(file.name),
          previewUrl,
          status: "pending",
        });
      } catch (ex) {
        if (cancelled) return;
        updateEntry(index, { status: "error", error: getErrorText(ex) });
      }
    };

    void Promise.all(files.map((file, index) => processFile(file, index)));

    return (): void => {
      cancelled = true;
      for (const url of createdUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [files, updateEntry]);

  const handleUpload = async (): Promise<void> => {
    setUploading(true);
    uploadedRef.current = [];
    let hasFailures = false;

    for (const [index, entry] of entries.entries()) {
      if (
        entry.status !== "pending" ||
        !entry.processedBlob ||
        !entry.processedFileName
      ) {
        continue;
      }
      updateEntry(index, { status: "uploading" });
      try {
        const description = entry.description.trim() || null;

        const metadata = await client.helpers.uploadAttachment(
          taskId,
          entry.processedBlob,
          entry.processedFileName,
          description,
        );

        uploadedRef.current.push(metadata);
        updateEntry(index, { status: "done" });
      } catch (ex) {
        hasFailures = true;
        const message = getErrorText(ex);
        updateEntry(index, { status: "error", error: message });
      }
    }
    setUploading(false);

    if (uploadedRef.current.length > 0) {
      onComplete(uploadedRef.current);
    }

    if (hasFailures) {
      setEntries((prev) => prev.filter((e) => e.status === "error"));
    } else {
      handleClose();
    }
  };

  const revokeAllPreviewUrls = useCallback((): void => {
    for (const url of previewUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    previewUrlsRef.current = [];
  }, []);

  useEffect(() => revokeAllPreviewUrls, [revokeAllPreviewUrls]);

  const handleClose = (): void => {
    revokeAllPreviewUrls();
    onClose();
  };

  const preparing = entries.some((e) => e.status === "preparing");
  const hasErrors = entries.some((e) => e.status === "error");
  const showForm = !hasErrors || entries.some((e) => e.status === "pending");
  const canUpload =
    !preparing && !uploading && entries.some((e) => e.status === "pending");

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  let uploadLabel = "Upload";
  if (preparing) {
    uploadLabel = "Preparing...";
  } else if (pendingCount > 1) {
    uploadLabel = `Upload (${pendingCount})`;
  }

  return (
    <Dialog
      open={open}
      onClose={uploading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {hasErrors && !showForm ? "Upload Failed" : "Upload Photos"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {entries.map((entry, index) => {
            const key = `${index}-${entry.originalFile.name}-${entry.originalFile.lastModified}-${entry.originalFile.size}`;

            if (entry.status === "error" && !showForm) {
              return (
                <Alert key={key} severity="error">
                  <strong>{entry.originalFile.name}</strong>: {entry.error}
                </Alert>
              );
            }

            return (
              <FileEntryRow
                key={key}
                entry={entry}
                onDescriptionChange={(desc) => {
                  updateEntry(index, { description: desc });
                }}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        {!uploading && showForm && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!canUpload}
            >
              {uploadLabel}
            </Button>
          </>
        )}
        {!uploading && !showForm && (
          <Button onClick={handleClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UploadAttachmentsDialog;
