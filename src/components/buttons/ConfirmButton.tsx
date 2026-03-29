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
  const [countdownMs, setCountdownMs] = useState(
    delayed ? CONFIRM_BUTTON_DELAY_MS : 0,
  );

  useEffect(() => {
    if (!delayed) {
      return;
    }

    const interval = setInterval(() => {
      setCountdownMs((c) => {
        const next = c - 100;
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 100);

    return (): void => {
      clearInterval(interval);
    };
  }, [delayed]);

  const enabled = !delayed || countdownMs <= 0;

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
