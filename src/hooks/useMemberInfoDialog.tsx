import React, { useState } from "react";

import MemberInfoDialog from "@/components/MemberInfoDialog";

type Props = Omit<React.ComponentProps<typeof MemberInfoDialog>, "onClose">;
const DEFAULT_PROPS = { member: null } as const;

/**
 * Hook to open a dialog with information about a member. Creates a `useState()` hook under the hood.
 *
 * Usage:
 * 1. Call the hook
 * 2. Render the returned component
 * 3. Call the returned function with the member to be displayed
 *
 * @returns the component to render and the function to call to open the dialog
 */
const useMemberInfoDialog = () => {
  const [props, setProps] = useState<Props>(DEFAULT_PROPS);

  const openMemberInfoDialog = (props: Props) => {
    setProps(props);
  };

  const memberInfoDialogComponent = (
    <MemberInfoDialog {...props} onClose={() => setProps(DEFAULT_PROPS)} />
  );

  return {
    memberInfoDialogComponent,
    openMemberInfoDialog,
  };
};

export default useMemberInfoDialog;
