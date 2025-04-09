import { JSX, useState } from "react";

import { AuditLogEntry } from "@/model/audit-log-dtos";

import AuditLogEntryDialog from "./AuditLogEntryDialog";

type Props = Pick<React.ComponentProps<typeof AuditLogEntryDialog>, "entry">;

type OpenProps = { entry: AuditLogEntry } & Omit<Props, "entry">;

const DEFAULT_DIALOG_PROPS = { entry: null } as const;

/**
 * Hook for audit log entry dialog. Creates a `useState()` hook under the hood.
 *
 * Do not forget to render the returned component.
 *
 * @returns object with the component to render and dialog functions
 */
const useAuditLogEntryDialog = (): {
  component: JSX.Element;
  open: (props: OpenProps) => void;
  close: () => void;
} => {
  const [dialogProps, setDialogProps] = useState<Props>(DEFAULT_DIALOG_PROPS);

  const close = (): void => setDialogProps(DEFAULT_DIALOG_PROPS);

  return {
    component: <AuditLogEntryDialog {...dialogProps} onClose={close} />,
    open: (props: OpenProps): void => setDialogProps(props),
    close,
  };
};

export default useAuditLogEntryDialog;
