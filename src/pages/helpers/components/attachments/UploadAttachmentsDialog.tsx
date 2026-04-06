import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";

import { AttachmentMetadata } from "@/model/helpers-dtos";
import {
  buildDescription,
  USER_DESCRIPTION_MAX_LENGTH,
} from "@/pages/helpers/attachment-utils";
import client from "@/utils/client";
import getErrorText from "@/utils/error-helper";
import { processImageForUpload, toJpegFileName } from "@/utils/image-utils";

type FileEntry = {
  originalFile: File;
  // Set once eager processing finishes successfully:
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
  existingCount: number;
  files: File[];
  onComplete: (uploaded: AttachmentMetadata[]) => void;
  onClose: () => void;
};

const UploadAttachmentsDialog = ({
  open,
  taskId,
  existingCount,
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

  // Eager processing: decode + resize + encode each file when the dialog opens.
  // This means previews are real JPEG thumbnails (even for HEIC, via BE transcode),
  // and the Upload click becomes a pure HTTP call.
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

    const promises = entries.map(async (entry, index) => {
      // Skip entries that failed during preparation
      if (
        entry.status !== "pending" ||
        !entry.processedBlob ||
        !entry.processedFileName
      ) {
        return;
      }
      updateStatus(index, "uploading");
      try {
        const description = buildDescription(
          existingCount + index,
          entry.description,
        );

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
    });

    await Promise.allSettled(promises);
    setUploading(false);

    // Notify parent of any successful uploads
    if (uploadedRef.current.length > 0) {
      onComplete(uploadedRef.current);
    }

    // Auto-close if all succeeded, otherwise show only errors
    if (uploadedRef.current.length === entries.length) {
      handleClose();
    } else {
      // Remove successful entries, keep only errors
      setEntries((prev) => prev.filter((e) => e.status === "error"));
    }
  };

  const handleClose = (): void => {
    // Revoke all preview URLs on close
    for (const entry of entries) {
      if (entry.previewUrl) {
        URL.revokeObjectURL(entry.previewUrl);
      }
    }
    onClose();
  };

  const preparing = entries.some((e) => e.status === "preparing");
  const hasErrors = entries.some((e) => e.status === "error");
  const showForm = !hasErrors || entries.some((e) => e.status === "pending");
  const canUpload =
    !preparing && !uploading && entries.some((e) => e.status === "pending");

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
          {entries.map((entry, index) =>
            entry.status === "error" && !showForm ? (
              <Alert key={index} severity="error">
                <strong>{entry.originalFile.name}</strong>: {entry.error}
              </Alert>
            ) : (
              <Stack key={index} spacing={1}>
                {entry.status === "preparing" ? (
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      borderRadius: 1,
                      bgcolor: "grey.100",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={24} />
                    <Typography variant="caption" color="text.secondary">
                      Preparing {entry.originalFile.name}...
                    </Typography>
                  </Box>
                ) : entry.status === "error" ? (
                  <Alert severity="error">
                    <strong>{entry.originalFile.name}</strong>: {entry.error}
                  </Alert>
                ) : entry.previewUrl ? (
                  <Box
                    component="img"
                    src={entry.previewUrl}
                    alt={entry.originalFile.name}
                    sx={{
                      width: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                {entry.status !== "preparing" && entry.status !== "error" && (
                  <TextField
                    size="small"
                    placeholder="Description (optional)"
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={5}
                    value={entry.description}
                    onChange={(e) => {
                      updateDescription(index, e.target.value);
                    }}
                    disabled={entry.status !== "pending"}
                    slotProps={{
                      htmlInput: { maxLength: USER_DESCRIPTION_MAX_LENGTH },
                    }}
                    helperText={`${entry.description.length}/${USER_DESCRIPTION_MAX_LENGTH}`}
                  />
                )}
                {entry.status === "uploading" && <CircularProgress size={16} />}
              </Stack>
            ),
          )}
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
              {preparing
                ? "Preparing..."
                : `Upload${entries.length > 1 ? ` (${entries.length})` : ""}`}
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
