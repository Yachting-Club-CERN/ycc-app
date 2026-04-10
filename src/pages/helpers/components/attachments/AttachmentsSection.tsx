import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";

import useConfirmationDialog from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import ErrorAlert from "@/components/ui/ErrorAlert";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { AttachmentMetadata, HelperTask } from "@/model/helpers-dtos";
import client from "@/utils/client";
import { UPLOAD_IMAGE_ACCEPT } from "@/utils/constants";

import AttachmentGallery from "./AttachmentGallery";
import UploadAttachmentsDialog from "./UploadAttachmentsDialog";

type Props = {
  task: HelperTask;
};

const AttachmentsSection = ({ task }: Props): React.ReactNode => {
  const currentUser = useCurrentUser();
  const confirmationDialog = useConfirmationDialog();
  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load attachments on mount
  useEffect(() => {
    const abortController = new AbortController();

    client.helpers
      .getAttachments(task.id, abortController.signal)
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
  }, [task.id]);

  const handleFilesSelected = (files: FileList | null): void => {
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUploadComplete = (uploaded: AttachmentMetadata[]): void => {
    setAttachments((prev) =>
      [...prev, ...uploaded].toSorted((a, b) =>
        (a.description ?? "").localeCompare(b.description ?? ""),
      ),
    );
  };

  const handleUploadDialogClose = (): void => {
    setSelectedFiles(null);
    // Reset the file input so picking the same files again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = useCallback(
    (attachmentId: number, imageUrl: string | undefined): void => {
      const attachment = attachments.find((a) => a.id === attachmentId);
      if (!attachment) return;

      confirmationDialog.open({
        title: "Delete photo?",
        content: imageUrl ? (
          <Box display="flex" justifyContent="center" mb={4}>
            <Box
              component="img"
              src={imageUrl}
              alt={attachment.name}
              sx={{
                maxWidth: "100%",
                maxHeight: 200,
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
          </Box>
        ) : null,
        confirmButtonColor: "error",
        confirmButtonText: "Delete Photo",
        delayConfirm: true,
        onConfirm: async () => {
          try {
            await client.helpers.deleteAttachment(task.id, attachmentId);
            setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
          } catch (err) {
            setError(err);
          }
        },
      });
    },
    [task.id, attachments, confirmationDialog],
  );

  const handleDeleteAll = useCallback((): void => {
    const total = attachments.length;
    if (total === 0) return;

    confirmationDialog.open({
      title: "Delete ALL photos?",
      content: (
        <DialogContentText mb={2}>
          This will permanently delete all <strong>{total}</strong> photo
          {total !== 1 ? "s" : ""} from this task.
        </DialogContentText>
      ),
      confirmButtonColor: "error",
      confirmButtonText: `Delete All ${total} Photos`,
      cancelButtonColor: "primary",
      delayConfirm: true,
      onConfirm: async () => {
        const ids = attachments.map((a) => a.id);
        const deleted = new Set<number>();
        try {
          await Promise.all(
            ids.map(async (id) => {
              await client.helpers.deleteAttachment(task.id, id);
              deleted.add(id);
            }),
          );
          setAttachments([]);
        } catch (err) {
          setAttachments((prev) => prev.filter((a) => !deleted.has(a.id)));
          setError(err);
        }
      },
    });
  }, [task.id, attachments, confirmationDialog]);

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (): void => {
    setDragging(false);
  };
  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1} mt={2} mb={1}>
        <Typography variant="h6">
          Photos{attachments.length > 0 ? ` (${attachments.length})` : ""}
        </Typography>
        {currentUser.helpersAppAdmin && attachments.length > 0 && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteForeverIcon />}
            onClick={handleDeleteAll}
          >
            Delete All
          </Button>
        )}
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={28} />
        </Box>
      )}

      <AttachmentGallery
        task={task}
        attachments={attachments}
        onDelete={handleDelete}
      />

      {/* Upload area */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          mt: 2,
          p: 2,
          border: "2px dashed",
          borderColor: dragging ? "primary.main" : "grey.300",
          borderRadius: 1,
          textAlign: "center",
          bgcolor: dragging ? "action.hover" : "transparent",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={UPLOAD_IMAGE_ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            handleFilesSelected(e.target.files);
          }}
        />
        <Button
          variant="outlined"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => fileInputRef.current?.click()}
        >
          Add Photos
        </Button>
        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          mt={0.5}
        >
          or drag and drop images here
        </Typography>
      </Box>

      {error && <ErrorAlert error={error} />}

      {/* Upload dialog */}
      {selectedFiles && (
        <UploadAttachmentsDialog
          open
          taskId={task.id}
          existingCount={attachments.length}
          files={selectedFiles}
          onComplete={handleUploadComplete}
          onClose={handleUploadDialogClose}
        />
      )}

      {confirmationDialog.component}
    </>
  );
};

export default AttachmentsSection;
