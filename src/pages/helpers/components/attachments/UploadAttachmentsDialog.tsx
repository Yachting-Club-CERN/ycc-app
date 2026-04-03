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
import { useRef, useState } from "react";

import { AttachmentMetadata } from "@/model/helpers-dtos";
import {
  buildDescription,
  USER_DESCRIPTION_MAX_LENGTH,
} from "@/pages/helpers/attachment-utils";
import client from "@/utils/client";
import getErrorText from "@/utils/error-helper";
import { processImageForUpload, toJpegFileName } from "@/utils/image-utils";

type FileEntry = {
  file: File;
  previewUrl: string;
  description: string;
  status: "pending" | "uploading" | "done" | "error";
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
      file,
      previewUrl: URL.createObjectURL(file),
      description: "",
      status: "pending" as const,
    })),
  );
  const [uploading, setUploading] = useState(false);
  const uploadedRef = useRef<AttachmentMetadata[]>([]);

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
      updateStatus(index, "uploading");
      try {
        const blob = await processImageForUpload(entry.file);
        const fileName = toJpegFileName(entry.file.name);
        const description = buildDescription(
          existingCount + index,
          entry.description,
        );

        const metadata = await client.helpers.uploadAttachment(
          taskId,
          blob,
          fileName,
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
      URL.revokeObjectURL(entry.previewUrl);
    }
    onClose();
  };

  const hasErrors = entries.some((e) => e.status === "error");
  const showForm = !hasErrors || entries.some((e) => e.status === "pending");

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
                <strong>{entry.file.name}</strong>: {entry.error}
              </Alert>
            ) : (
              <Stack key={index} spacing={1}>
                <Box
                  component="img"
                  src={entry.previewUrl}
                  alt={entry.file.name}
                  sx={{
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
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
              disabled={uploading}
            >
              Upload {entries.length > 1 ? `(${entries.length})` : ""}
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
