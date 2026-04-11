import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { type FileEntry } from "./UploadAttachmentsDialog";

const FileEntryPreview = ({ entry }: { entry: FileEntry }): React.ReactNode => {
  if (entry.status === "preparing") {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "4 / 3",
          borderRadius: 1,
          bgcolor: "grey.100",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="caption" color="text.secondary">
          Preparing {entry.originalFile.name}...
        </Typography>
      </Box>
    );
  }

  if (entry.status === "error") {
    return (
      <Alert severity="error">
        <strong>{entry.originalFile.name}</strong>: {entry.error}
      </Alert>
    );
  }

  if (entry.previewUrl) {
    return (
      <Box
        component="img"
        src={entry.previewUrl}
        alt={entry.originalFile.name}
        sx={{
          width: "100%",
          objectFit: "cover",
          borderRadius: 1,
          flexShrink: 0,
        }}
      />
    );
  }

  return null;
};

export default FileEntryPreview;
