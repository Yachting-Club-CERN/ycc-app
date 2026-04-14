import Box from "@mui/material/Box";
import { useCallback, useState } from "react";

import useCurrentUser from "@/context/auth/useCurrentUser";
import { AttachmentMetadata, HelperTask } from "@/model/helpers-dtos";
import { canEdit } from "@/pages/helpers/helpers-utils";

import AttachmentLightbox from "./AttachmentLightbox";
import AttachmentThumbnail from "./AttachmentThumbnail";
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 1.5,
        }}
      >
        {attachments.map((attachment, index) => {
          const image = imageUrls.get(attachment.id);
          return (
            <AttachmentThumbnail
              key={attachment.id}
              attachment={attachment}
              image={image}
              canDelete={canDeleteAttachment(attachment)}
              onClick={() => {
                setLightboxIndex(index);
              }}
              onDelete={() => {
                onDelete(attachment.id, image?.url);
              }}
            />
          );
        })}
      </Box>

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
