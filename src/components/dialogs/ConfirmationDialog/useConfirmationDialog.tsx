import { useState } from "react";

import ConfirmationDialog from "./ConfirmationDialog";

export type OpenConfirmationDialogProps = Pick<
  React.ComponentProps<typeof ConfirmationDialog>,
  | "title"
  | "content"
  | "confirmButtonColor"
  | "confirmButtonText"
  | "cancelButtonColor"
  | "delayConfirm"
  | "onConfirm"
>;

/**
 * Hook for confirmation dialog. Creates `useState()` hooks under the hood.
 *
 * Do not forget to render the returned component.
 *
 * @returns object with the component to render and dialog functions
 */
const useConfirmationDialog = (): {
  component: React.ReactNode;
  open: (props: OpenConfirmationDialogProps) => void;
  close: () => void;
} => {
  const [dialogProps, setDialogProps] =
    useState<OpenConfirmationDialogProps | null>(null);
  const [confirming, setConfirming] = useState(false);

  const close = (): void => {
    setDialogProps(null);
  };

  return {
    component: dialogProps && (
      <ConfirmationDialog
        {...dialogProps}
        open
        confirming={confirming}
        onConfirm={async () => {
          try {
            setConfirming(true);
            await dialogProps.onConfirm();
          } finally {
            setConfirming(false);
            setDialogProps(null);
          }
        }}
        onClose={close}
      />
    ),
    open: (props: OpenConfirmationDialogProps): void => {
      setDialogProps(props);
    },
    close,
  };
};

export default useConfirmationDialog;
