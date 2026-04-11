import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { AttachmentMetadata } from "@/model/helpers-dtos";

type AttachmentImage = {
  url: string | undefined;
  error: boolean;
};

type Props = {
  attachment: AttachmentMetadata;
  image: AttachmentImage | undefined;
  canDelete: boolean;
  onClick: () => void;
  onDelete: () => void;
};

const AttachmentThumbnail = ({
  attachment,
  image,
  canDelete,
  onClick,
  onDelete,
}: Props): React.ReactNode => {
  const description = attachment.description?.trim() ?? "";

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          aspectRatio: "1",
          borderRadius: 1,
          overflow: "hidden",
          cursor: "pointer",
          bgcolor: "grey.100",
        }}
        onClick={onClick}
      >
        {image?.url ? (
          <Box
            component="img"
            src={image.url}
            alt={description || attachment.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : image?.error ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <BrokenImageIcon color="disabled" />
          </Box>
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
        {canDelete && (
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
              onDelete();
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
};

export default AttachmentThumbnail;
