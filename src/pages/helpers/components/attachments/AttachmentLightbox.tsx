import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Keyboard, Navigation, Zoom } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";

import { AttachmentMetadata } from "@/model/helpers-dtos";
import { extractCaption } from "@/pages/helpers/attachment-utils";

type Props = {
  attachments: AttachmentMetadata[];
  imageUrls: Map<number, string>;
  initialIndex: number;
  canDelete: (attachment: AttachmentMetadata) => boolean;
  onDelete: (attachmentId: number, imageUrl: string | undefined) => void;
  onClose: () => void;
};

const AttachmentLightbox = ({
  attachments,
  imageUrls,
  initialIndex,
  canDelete,
  onDelete,
  onClose,
}: Props): React.ReactNode => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(initialIndex);

  const activeAttachment = attachments[activeSlideIndex];

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen
      sx={{ "& .MuiDialog-paper": { bgcolor: "black" } }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          color: "white",
        }}
      >
        <CloseIcon />
      </IconButton>
      {activeAttachment != null && canDelete(activeAttachment) && (
        <IconButton
          onClick={() => {
            onClose();
            onDelete(activeAttachment.id, imageUrls.get(activeAttachment.id));
          }}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 10,
            color: "white",
          }}
        >
          <DeleteIcon />
        </IconButton>
      )}
      <Swiper
        modules={[Keyboard, Navigation, Zoom]}
        keyboard={{ enabled: true }}
        navigation
        zoom
        initialSlide={initialIndex}
        onSlideChange={(swiper: SwiperClass) => {
          setActiveSlideIndex(swiper.activeIndex);
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {attachments.map((attachment) => {
          const url = imageUrls.get(attachment.id);
          const description = extractCaption(attachment.description);
          return (
            <SwiperSlide
              key={attachment.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {url ? (
                <div className="swiper-zoom-container">
                  <img
                    src={url}
                    alt={description}
                    style={{
                      maxWidth: "100%",
                      maxHeight: description ? "calc(100vh - 80px)" : "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                <CircularProgress sx={{ color: "white" }} />
              )}
              {description && (
                <Typography
                  sx={{
                    color: "white",
                    textAlign: "center",
                    whiteSpace: "pre-wrap",
                    px: 2,
                    pb: 1,
                    flexShrink: 0,
                  }}
                >
                  {description}
                </Typography>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Dialog>
  );
};

export default AttachmentLightbox;
