import { useState } from "react";

import ConfirmationDialog, {
  ConfirmationDialogContent,
} from "@/components/ConfirmationDialog";

type OpenConfirmationDialogProps = {
  title: string;
  content: ConfirmationDialogContent;
  displayContentAsDialogContentText?: boolean;
  confirmButtonText?: string;
  shouldDelayConfirm?: boolean;
  onConfirm: () => void | Promise<void>;
};

/**
 * Hook to open a confirmation dialog. Creates a `useState()` hook under the hood.
 *
 * Usage:
 * 1. Call the hook
 * 2. Render the returned component
 * 3. Call the returned function to open the dialog
 *
 * @returns the component to render and the function to call to open the dialog
 */
const useConfirmationDialog = () => {
  const [openConfirmationDialogProps, setOpenConfirmationDialogProps] =
    useState<OpenConfirmationDialogProps>({
      title: "",
      content: "",
      onConfirm: () => {},
    });

  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const openConfirmationDialog = (props: OpenConfirmationDialogProps) => {
    setOpenConfirmationDialogProps(props);
    setOpen(true);
  };

  const { onConfirm, ...dialogPropsWithoutOnConfirm } =
    openConfirmationDialogProps;

  const confirmationDialogComponent = (
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
      onClose={() => setOpen(false)}
    />
  );

  return {
    confirmationDialogComponent,
    openConfirmationDialog,
  };
};

export default useConfirmationDialog;
