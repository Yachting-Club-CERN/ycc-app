import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import { useCallback, useRef, useState } from "react";

import useConfirmationDialog from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import DropZone from "@/components/input/DropZone";
import ErrorAlert from "@/components/ui/ErrorAlert";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { HelperTask } from "@/model/helpers-dtos";
import client from "@/utils/client";
import { UPLOAD_IMAGE_ACCEPT } from "@/utils/constants";

import AttachmentGallery from "./AttachmentGallery";
import UploadAttachmentsDialog from "./UploadAttachmentsDialog";
import useAttachments from "./useAttachments";

type Props = {
  task: HelperTask;
};

const AttachmentsSection = ({ task }: Props): React.ReactNode => {
  const currentUser = useCurrentUser();
  const confirmationDialog = useConfirmationDialog();
  const {
    attachments,
    loading,
    error,
    setError,
    addUploaded,
    removeAttachment,
    removeAttachments,
  } = useAttachments(task.id);
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: File[]): void => {
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleUploadDialogClose = (): void => {
    setSelectedFiles(null);
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
            removeAttachment(attachmentId);
          } catch (err) {
            setError(err);
          }
        },
      });
    },
    [task.id, attachments, confirmationDialog, removeAttachment, setError],
  );

  const handleDeleteAll = useCallback((): void => {
    const total = attachments.length;
    if (total === 0) return;

    confirmationDialog.open({
      title: "Delete ALL photos?",
      content: (
        <DialogContentText mb={2}>
          This will permanently delete all <strong>{total}</strong> photo
          {total === 1 ? "" : "s"} from this task.
        </DialogContentText>
      ),
      confirmButtonColor: "error",
      confirmButtonText: `Delete All ${total} Photos`,
      cancelButtonColor: "primary",
      delayConfirm: true,
      onConfirm: async () => {
        const ids = attachments.map((a) => a.id);
        const results = await Promise.allSettled(
          ids.map(async (id) => {
            await client.helpers.deleteAttachment(task.id, id);
            return id;
          }),
        );
        const deletedIds = results
          .filter(
            (r): r is PromiseFulfilledResult<number> =>
              r.status === "fulfilled",
          )
          .map((r) => r.value);
        removeAttachments(deletedIds);
        const firstFailure = results.find(
          (r): r is PromiseRejectedResult => r.status === "rejected",
        );
        if (firstFailure) {
          setError(firstFailure.reason);
        }
      },
    });
  }, [task.id, attachments, confirmationDialog, removeAttachments, setError]);

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

      <DropZone accept={UPLOAD_IMAGE_ACCEPT} onFiles={handleFilesSelected}>
        <input
          ref={fileInputRef}
          type="file"
          accept={UPLOAD_IMAGE_ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) {
              handleFilesSelected(Array.from(e.target.files));
            }
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
      </DropZone>

      {error && <ErrorAlert error={error} />}

      {selectedFiles && (
        <UploadAttachmentsDialog
          open
          taskId={task.id}
          files={selectedFiles}
          onComplete={addUploaded}
          onClose={handleUploadDialogClose}
        />
      )}

      {confirmationDialog.component}
    </>
  );
};

export default AttachmentsSection;
