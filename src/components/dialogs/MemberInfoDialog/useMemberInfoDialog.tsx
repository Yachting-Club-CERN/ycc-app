import { JSX, useState } from "react";

import { MemberPublicInfo } from "@/model/dtos";

import MemberInfoDialog from "./MemberInfoDialog";

type Props = Pick<
  React.ComponentProps<typeof MemberInfoDialog>,
  "member" | "extra"
>;

type OpenProps = { member: MemberPublicInfo } & Omit<Props, "member">;

const DEFAULT_DIALOG_PROPS = { member: null } as const;

/**
 * Hook for member info dialog. Creates a `useState()` hook under the hood.
 *
 * Do not forget to render the returned component.
 *
 * @returns object with the component to render and dialog functions
 */
const useMemberInfoDialog = (): {
  component: JSX.Element;
  open: (props: OpenProps) => void;
  close: () => void;
} => {
  const [dialogProps, setDialogProps] = useState<Props>(DEFAULT_DIALOG_PROPS);

  const close = (): void => setDialogProps(DEFAULT_DIALOG_PROPS);

  return {
    component: <MemberInfoDialog {...dialogProps} onClose={close} />,
    open: (props: OpenProps): void => setDialogProps(props),
    close,
  };
};

export default useMemberInfoDialog;
