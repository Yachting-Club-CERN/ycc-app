import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { useEffect, useRef, useState } from "react";

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

  // Eager processing: decode + resize + encode each file when the dialog opens.
  // Previews are real JPEG thumbnails (even for HEIC via BE transcode),
  // so the Upload click becomes a pure HTTP call.
  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];

    void (async (): Promise<void> => {
      await Promise.all(
        files.map(async (file, index) => {
          try {
            const blob = await processImageForUpload(file);
            if (cancelled) {
              return;
            }
            const previewUrl = URL.createObjectURL(blob);
            createdUrls.push(previewUrl);
            previewUrlsRef.current.push(previewUrl);
            setEntries((prev) =>
              prev.map((entry, i) =>
                i === index
                  ? {
                      ...entry,
                      processedBlob: blob,
                      processedFileName: toJpegFileName(file.name),
                      previewUrl,
                      status: "pending",
                    }
                  : entry,
              ),
            );
          } catch (ex) {
            if (cancelled) {
              return;
            }
            setEntries((prev) =>
              prev.map((entry, i) =>
                i === index
                  ? { ...entry, status: "error", error: getErrorText(ex) }
                  : entry,
              ),
            );
          }
        }),
      );
    })();

    return (): void => {
      cancelled = true;
      for (const url of createdUrls) {
        URL.revokeObjectURL(url);
      }
    };
    // Process once per dialog open. The `files` array identity is stable for
    // the lifetime of a single dialog instance (set by the parent before open).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDescription = (index: number, description: string): void => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, description } : entry)),
    );
  };

  const updateStatus = (
    index: number,
    status: FileEntry["status"],
    error?: string,
  ): void => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, status, error } : entry,
      ),
    );
  };

  const handleUpload = async (): Promise<void> => {
    setUploading(true);
    uploadedRef.current = [];

    for (const [index, entry] of entries.entries()) {
      if (
        entry.status !== "pending" ||
        !entry.processedBlob ||
        !entry.processedFileName
      ) {
        continue;
      }
      updateStatus(index, "uploading");
      try {
        const description = entry.description.trim() || null;

        const metadata = await client.helpers.uploadAttachment(
          taskId,
          entry.processedBlob,
          entry.processedFileName,
          description,
        );

        uploadedRef.current.push(metadata);
        updateStatus(index, "done");
      } catch (ex) {
        const message = getErrorText(ex);
        updateStatus(index, "error", message);
      }
    }
    setUploading(false);

    if (uploadedRef.current.length > 0) {
      onComplete(uploadedRef.current);
    }

    if (uploadedRef.current.length === entries.length) {
      handleClose();
    } else {
      setEntries((prev) => prev.filter((e) => e.status === "error"));
    }
  };

  const revokeAllPreviewUrls = (): void => {
    for (const url of previewUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    previewUrlsRef.current = [];
  };

  // Revoke all preview URLs on unmount (route change, error boundary, etc.)
  useEffect(() => revokeAllPreviewUrls, []);

  const handleClose = (): void => {
    revokeAllPreviewUrls();
    onClose();
  };

  const preparing = entries.some((e) => e.status === "preparing");
  const hasErrors = entries.some((e) => e.status === "error");
  const showForm = !hasErrors || entries.some((e) => e.status === "pending");
  const canUpload =
    !preparing && !uploading && entries.some((e) => e.status === "pending");

  const uploadLabel = preparing
    ? "Preparing..."
    : entries.length > 1
      ? `Upload (${entries.length})`
      : "Upload";

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
            const key = `${entry.originalFile.name}-${entry.originalFile.lastModified}`;

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
                  updateDescription(index, desc);
                }}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        {uploading ? null : showForm ? (
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
        ) : (
          <Button onClick={handleClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UploadAttachmentsDialog;
