import React, { useState } from "react";

import MemberInfoDialog from "@/components/dialogs/MemberInfoDialog";
import { MemberPublicInfo } from "@/model/dtos";

type Props = Pick<
  React.ComponentProps<typeof MemberInfoDialog>,
  "member" | "extra"
>;
const DEFAULT_DIALOG_PROPS = { member: null } as const;

/**
 * Hook for member info dialog. Creates a `useState()` hook under the hood.
 *
 * Do not forget to render the returned component.
 *
 * @returns object with the component to render and dialog functions
 */
const useMemberInfoDialog = () => {
  const [dialogProps, setDialogProps] = useState<Props>(DEFAULT_DIALOG_PROPS);

  const close = () => setDialogProps(DEFAULT_DIALOG_PROPS);

  return {
    component: <MemberInfoDialog {...dialogProps} onClose={close} />,
    open: (props: { member: MemberPublicInfo } & Omit<Props, "member">) => {
      setDialogProps(props);
    },
    close,
  };
};

export default useMemberInfoDialog;
