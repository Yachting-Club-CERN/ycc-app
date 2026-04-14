import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
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

import { AttachmentImage } from "./useAttachmentImages";

type Props = {
  attachments: AttachmentMetadata[];
  imageUrls: Map<number, AttachmentImage>;
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
            onDelete(
              activeAttachment.id,
              imageUrls.get(activeAttachment.id)?.url,
            );
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
          const image = imageUrls.get(attachment.id);
          const description = attachment.description?.trim() ?? "";
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
              {image?.url && (
                <div className="swiper-zoom-container">
                  <img
                    src={image.url}
                    alt={description || attachment.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: description ? "calc(100vh - 80px)" : "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              {image?.error && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BrokenImageIcon sx={{ color: "grey.500", fontSize: 48 }} />
                </Box>
              )}
              {!image?.url && !image?.error && (
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
