import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Navigation, Zoom } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";

import useCurrentUser from "@/context/auth/useCurrentUser";
import { AttachmentMetadata, HelperTask } from "@/model/helpers-dtos";
import { extractCaption } from "@/pages/helpers/attachment-utils";
import { canEdit } from "@/pages/helpers/helpers-utils";
import client from "@/utils/client";

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
  const [imageUrls, setImageUrls] = useState(new Map<number, string>());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const urlsRef = useRef(new Map<number, string>());

  // Download all attachment images as object URLs
  useEffect(() => {
    const abortController = new AbortController();

    const loadImages = async (): Promise<void> => {
      const newUrls = new Map<number, string>();

      await Promise.allSettled(
        attachments.map(async (attachment) => {
          // Reuse existing URL if already loaded
          const existing = urlsRef.current.get(attachment.id);
          if (existing) {
            newUrls.set(attachment.id, existing);
            return;
          }

          try {
            const blob = await client.helpers.downloadAttachment(
              task.id,
              attachment.id,
              abortController.signal,
            );
            const url = URL.createObjectURL(blob);
            newUrls.set(attachment.id, url);
          } catch (error) {
            console.error(
              "[attachments] Failed to download attachment",
              attachment.id,
              error,
            );
          }
        }),
      );

      if (!abortController.signal.aborted) {
        // Revoke URLs that are no longer needed
        for (const [id, url] of urlsRef.current) {
          if (!newUrls.has(id)) {
            URL.revokeObjectURL(url);
          }
        }
        urlsRef.current = newUrls;
        setImageUrls(newUrls);
      }
    };

    void loadImages();

    return (): void => {
      abortController.abort();
    };
  }, [task.id, attachments]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    return (): void => {
      for (const url of urlsRef.current.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

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

      {/* Swiper Lightbox */}
      <Dialog
        open={lightboxIndex !== null}
        onClose={() => {
          setLightboxIndex(null);
        }}
        fullScreen
        sx={{ "& .MuiDialog-paper": { bgcolor: "black" } }}
      >
        <IconButton
          onClick={() => {
            setLightboxIndex(null);
          }}
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
        {attachments[activeSlideIndex] != null &&
          canDeleteAttachment(attachments[activeSlideIndex]) && (
            <IconButton
              onClick={() => {
                const attachment = attachments[activeSlideIndex];
                if (!attachment) return;
                setLightboxIndex(null);
                onDelete(attachment.id, imageUrls.get(attachment.id));
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
        {lightboxIndex !== null && (
          <Swiper
            modules={[Keyboard, Navigation, Zoom]}
            keyboard={{ enabled: true }}
            navigation
            zoom
            initialSlide={lightboxIndex}
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
                          maxHeight: description
                            ? "calc(100vh - 80px)"
                            : "100%",
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
        )}
      </Dialog>
    </>
  );
};

export default AttachmentGallery;
