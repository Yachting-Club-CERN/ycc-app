import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

import { CONFIRM_BUTTON_DELAY_MS } from "@/utils/constants";

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
  const [countdownMs, setCountdownMs] = useState(CONFIRM_BUTTON_DELAY_MS);

  useEffect(() => {
    if (!delayed) {
      return;
    }

    const interval = setInterval(() => {
      setCountdownMs((c) => c - 100);
    }, 100);

    const timeout = setTimeout(() => {
      setEnabled(true);
      clearInterval(interval);
    }, CONFIRM_BUTTON_DELAY_MS);

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
      {enabled ? text : `${text} (${Math.ceil(countdownMs / 1000)}s)`}
    </Button>
  );
};

export default ConfirmButton;
