import { useState } from "react";

import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";

export type OpenConfirmationDialogProps = Pick<
  React.ComponentProps<typeof ConfirmationDialog>,
  "title" | "content" | "confirmButtonText" | "delayConfirm" | "onConfirm"
>;

const DEFAULT_DIALOG_PROPS = {
  title: "",
  content: null,
  onConfirm: () => {},
} as const;

/**
 * Hook for confirmation dialog. Creates `useState()` hooks under the hood.
 *
 * Do not forget to render the returned component.
 *
 * @returns object with the component to render and dialog functions
 */
const useConfirmationDialog = () => {
  const [dialogProps, setDialogProps] =
    useState<OpenConfirmationDialogProps>(DEFAULT_DIALOG_PROPS);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { onConfirm, ...dialogPropsWithoutOnConfirm } = dialogProps;

  const close = () => {
    setDialogProps(DEFAULT_DIALOG_PROPS);
    setOpen(false);
  };

  return {
    component: (
      <ConfirmationDialog
        {...dialogPropsWithoutOnConfirm}
        open={open}
        confirming={confirming}
        onConfirm={async () => {
          try {
            setConfirming(true);
            await onConfirm();
          } finally {
            setConfirming(false);
            setOpen(false);
          }
        }}
        onClose={close}
      />
    ),
    open: (props: OpenConfirmationDialogProps) => {
      setDialogProps(props);
      setOpen(true);
    },
    close,
  };
};

export default useConfirmationDialog;
