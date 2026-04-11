import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";

import useCurrentUser from "@/context/auth/useCurrentUser";
import { AttachmentMetadata, HelperTask } from "@/model/helpers-dtos";
import { extractCaption } from "@/pages/helpers/attachment-utils";
import { canEdit } from "@/pages/helpers/helpers-utils";

import AttachmentLightbox from "./AttachmentLightbox";
import useAttachmentImages from "./useAttachmentImages";

type Props = {
  task: HelperTask;
  attachments: AttachmentMetadata[];
  onDelete: (attachmentId: number, imageUrl: string | undefined) => void;
};

const AttachmentGallery = ({
  task,
  attachments,
  onDelete,
}: Props): React.ReactNode => {
  const currentUser = useCurrentUser();
  const imageUrls = useAttachmentImages(task.id, attachments);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const canDeleteAttachment = useCallback(
    (attachment: AttachmentMetadata): boolean =>
      attachment.owner.id === currentUser.memberId ||
      canEdit(task, currentUser),
    [task, currentUser],
  );

  if (attachments.length === 0) {
    return null;
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 1.5,
        }}
      >
        {attachments.map((attachment, index) => {
          const url = imageUrls.get(attachment.id);
          const description = extractCaption(attachment.description);

          return (
            <Box key={attachment.id}>
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: 1,
                  overflow: "hidden",
                  cursor: "pointer",
                  bgcolor: "grey.100",
                }}
                onClick={() => {
                  setLightboxIndex(index);
                }}
              >
                {url ? (
                  <Box
                    component="img"
                    src={url}
                    alt={description || attachment.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                )}
                {canDeleteAttachment(attachment) && (
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(attachment.id, url);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="caption" display="block" noWrap>
                {description}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                noWrap
              >
                {attachment.owner.firstName} {attachment.owner.lastName}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <AttachmentLightbox
          attachments={attachments}
          imageUrls={imageUrls}
          initialIndex={lightboxIndex}
          canDelete={canDeleteAttachment}
          onDelete={onDelete}
          onClose={() => {
            setLightboxIndex(null);
          }}
        />
      )}
    </>
  );
};

export default AttachmentGallery;
