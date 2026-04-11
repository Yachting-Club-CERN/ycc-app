import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { ATTACHMENT_DESCRIPTION_MAX_LENGTH } from "@/utils/constants";

import FileEntryPreview from "./FileEntryPreview";
import { type FileEntry } from "./UploadAttachmentsDialog";

const FileEntryRow = ({
  entry,
  onDescriptionChange,
}: {
  entry: FileEntry;
  onDescriptionChange: (description: string) => void;
}): React.ReactNode => {
  const showDescription =
    entry.status !== "preparing" && entry.status !== "error";

  return (
    <Stack spacing={1}>
      <FileEntryPreview entry={entry} />
      {showDescription && (
        <TextField
          size="small"
          placeholder="Description (optional)"
          fullWidth
          multiline
          minRows={3}
          maxRows={5}
          value={entry.description}
          onChange={(e) => {
            onDescriptionChange(e.target.value);
          }}
          disabled={entry.status !== "pending"}
          slotProps={{
            htmlInput: {
              maxLength: ATTACHMENT_DESCRIPTION_MAX_LENGTH,
            },
          }}
          helperText={`${entry.description.length}/${ATTACHMENT_DESCRIPTION_MAX_LENGTH}`}
        />
      )}
      {entry.status === "uploading" && <CircularProgress size={16} />}
    </Stack>
  );
};

export default FileEntryRow;
