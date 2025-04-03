import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

import { CONFIRM_BUTTON_DELAY_SECONDS } from "@/utils/constants";

type Props = {
  onConfirm: () => void;
  loading: boolean;
  text?: string;
  delayed?: boolean;
};

const ConfirmButton = (props: Props) => {
  const { onConfirm, loading } = props;
  const text = props.text ?? "Confirm";
  const delayed = props.delayed ?? false;

  const [enabled, setEnabled] = useState(!delayed);
  const [countdown, setCountdown] = useState(CONFIRM_BUTTON_DELAY_SECONDS);

  useEffect(() => {
    if (!delayed) {
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

export default ConfirmButton;
