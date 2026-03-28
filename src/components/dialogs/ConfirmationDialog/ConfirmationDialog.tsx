import Button, { ButtonProps } from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import ConfirmButton from "@/components/buttons/ConfirmButton";

type Props = {
  title: string;
  content: React.ReactElement | null; // No content has to be explicit
  confirmButtonColor?: ButtonProps["color"] | undefined;
  confirmButtonText?: string | undefined;
  cancelButtonColor?: ButtonProps["color"] | undefined;
  delayConfirm?: boolean | undefined;

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
  confirmButtonColor = "success",
  cancelButtonColor = "error",
  open,
  confirming,
  delayConfirm,
  onConfirm,
  onClose,
}: Props): React.ReactNode => {
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
        <Button onClick={onClose} variant="text" color={cancelButtonColor}>
          Cancel
        </Button>
        <ConfirmButton
          onConfirm={onConfirm}
          loading={confirming}
          color={confirmButtonColor}
          text={confirmButtonText}
          delayed={delayConfirm}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
