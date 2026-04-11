import Box from "@mui/material/Box";
import { type Accept, useDropzone } from "react-dropzone";

type Props = {
  /** Comma-separated MIME types, e.g. "image/jpeg,image/png" */
  accept?: string;
  children: React.ReactNode;
  onFiles: (files: File[]) => void;
};

const toAccept = (accept: string): Accept =>
  Object.fromEntries(accept.split(",").map((t) => [t.trim(), []]));

/**
 * A drag-and-drop zone that wraps its children and calls `onFiles` when files
 * are dropped onto it.
 */
const DropZone = ({ accept, children, onFiles }: Props): React.ReactNode => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...(accept ? { accept: toAccept(accept) } : {}),
    noClick: true,
    noKeyboard: true,
    onDrop: onFiles,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        mt: 2,
        p: 2,
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "grey.300",
        borderRadius: 1,
        textAlign: "center",
        bgcolor: isDragActive ? "action.hover" : "transparent",
        transition: "all 0.2s",
      }}
    >
      <input {...getInputProps()} />
      {children}
    </Box>
  );
};

export default DropZone;
