import {MemberPublicInfo} from 'model/dtos';
import {useState} from 'react';
import React from 'react';

import MemberInfoDialog from '@app/components/MemberInfoDialog';

/**
 * Hook to open a dialog with information about a member. Creates `useState()` hook under the hood.
 *
 * Usage:
 * 1. Call the hook
 * 2. Render the returned component
 * 3. Call the returned function with the member to be displayed
 *
 * @returns the component to render and the function to call to open the dialog
 */
const useMemberInfoDialog = () => {
  const [member, setMember] = useState<MemberPublicInfo | null>(null);
  const openMemberInfoDialog = (member: MemberPublicInfo) => {
    setMember(member);
  };

  const memberInfoDialogComponent = (
    <MemberInfoDialog member={member} onClose={() => setMember(null)} />
  );

  return {
    memberInfoDialogComponent,
    openMemberInfoDialog,
  };
};

export default useMemberInfoDialog;
