import Button, { ButtonProps } from "@mui/material/Button";
import { useEffect, useState } from "react";

import { CONFIRM_BUTTON_DELAY_MS } from "@/utils/constants";

type Props = {
  onConfirm: () => void;
  loading: boolean;
  color?: ButtonProps["color"] | undefined;
  text?: string | undefined;
  delayed?: boolean | undefined;
};

const ConfirmButton = ({
  onConfirm,
  loading,
  color = "success",
  text = "Confirm",
  delayed = false,
}: Props): React.ReactNode => {
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

    return (): void => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [delayed]);

  return (
    <Button
      onClick={onConfirm}
      variant="contained"
      color={color}
      autoFocus
      disabled={!enabled}
      loading={loading}
    >
      {enabled ? text : `${text} (${Math.ceil(countdownMs / 1000)}s)`}
    </Button>
  );
};

export default ConfirmButton;
