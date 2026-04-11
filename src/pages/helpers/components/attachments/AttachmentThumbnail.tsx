import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { AttachmentMetadata } from "@/model/helpers-dtos";
import { extractCaption } from "@/pages/helpers/attachment-utils";

type Props = {
  attachment: AttachmentMetadata;
  imageUrl: string | undefined;
  canDelete: boolean;
  onClick: () => void;
  onDelete: () => void;
};

const AttachmentThumbnail = ({
  attachment,
  imageUrl,
  canDelete,
  onClick,
  onDelete,
}: Props): React.ReactNode => {
  const description = extractCaption(attachment.description);

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
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={description || attachment.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
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
