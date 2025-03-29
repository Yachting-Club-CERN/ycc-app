import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React, { JSX, useEffect, useState } from "react";

type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

export type StringOrElement = string | JSX.Element;

export type ConfirmationDialogContent =
  | StringOrElement
  | ArrayOneOrMore<StringOrElement>;

const CONFIRM_BUTTON_DELAY_SECONDS = 3;

type ConfirmButtonProps = {
  onConfirm: () => void;
  loading: boolean;
  text?: string;
  shouldDelay?: boolean;
};

const ConfirmButton = (props: ConfirmButtonProps) => {
  const { onConfirm, loading } = props;
  const text = props.text ?? "Confirm";
  const shouldDelay = props.shouldDelay ?? false;

  const [enabled, setEnabled] = useState(!shouldDelay);
  const [countdown, setCountdown] = useState(CONFIRM_BUTTON_DELAY_SECONDS);

  useEffect(() => {
    if (!shouldDelay) {
      return;
    }

    const interval = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      setEnabled(true);
      clearInterval(interval);
    }, CONFIRM_BUTTON_DELAY_SECONDS * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <Button
      onClick={onConfirm}
      variant="contained"
      color="success"
      autoFocus
      disabled={!enabled}
      loading={loading}
    >
      {enabled ? text : `${text} (${countdown}s)`}
    </Button>
  );
};

type Props = {
  title: string;
  content: ConfirmationDialogContent;
  open: boolean;
  confirming: boolean;
  displayContentAsDialogContentText?: boolean;
  confirmButtonText?: string;
  shouldDelayConfirm?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmationDialog = ({
  title,
  content,
  open,
  confirming,
  displayContentAsDialogContentText,
  confirmButtonText,
  shouldDelayConfirm,
  onConfirm,
  onClose,
}: Props) => {
  const items: ArrayOneOrMore<StringOrElement> = Array.isArray(content)
    ? content
    : [content];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      className="ycc-confirmation-dialog"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {items.map((item, index) => {
          const lastItem = index === items.length - 1;

          if (displayContentAsDialogContentText || typeof item === "string") {
            return (
              <DialogContentText key={index} mb={lastItem ? 0 : 2}>
                {item}
              </DialogContentText>
            );
          } else {
            return <React.Fragment key={index}>{item}</React.Fragment>;
          }
        })}
      </DialogContent>
      <DialogActions sx={{ paddingBottom: 2, paddingRight: 2 }}>
        <Button onClick={onClose} variant="text" color="error">
          Cancel
        </Button>
        <ConfirmButton
          onConfirm={onConfirm}
          loading={confirming}
          text={confirmButtonText}
          shouldDelay={shouldDelayConfirm}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
