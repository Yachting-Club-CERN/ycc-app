import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { JSX } from "react";

import ConfirmButton from "../buttons/ConfirmButton";

type Props = {
  title: string;
  content: JSX.Element | null; // No content has to be explicit
  confirmButtonText?: string;
  delayConfirm?: boolean;

  // State
  open: boolean;
  confirming: boolean;

  // Callbacks
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

const ConfirmationDialog = ({
  title,
  content,
  confirmButtonText,
  open,
  confirming,
  delayConfirm,
  onConfirm,
  onClose,
}: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      className="ycc-confirmation-dialog"
    >
      <DialogTitle>{title}</DialogTitle>
      {content && (
        <DialogContent sx={{ pt: 0, pb: 0 }}>{content}</DialogContent>
      )}
      <DialogActions sx={{ pt: 0, pr: 3, pb: 2, pl: 3 }}>
        <Button onClick={onClose} variant="text" color="error">
          Cancel
        </Button>
        <ConfirmButton
          onConfirm={onConfirm}
          loading={confirming}
          text={confirmButtonText}
          delayed={delayConfirm}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
