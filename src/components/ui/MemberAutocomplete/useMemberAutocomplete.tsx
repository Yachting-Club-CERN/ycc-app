import { SxProps } from "@mui/material";
import { JSX, useRef } from "react";

import { MemberPublicInfo } from "@/model/dtos";

import MemberAutocomplete from "./MemberAutocomplete";

const useMemberAutocomplete = (
  componentSx?: SxProps,
): {
  component: JSX.Element;
  requireSelectedMember: MemberPublicInfo;
  clearSelection: () => void;
} => {
  const selectedMemberRef = useRef<MemberPublicInfo | null>(null);

  return {
    component: (
      <MemberAutocomplete
        onChange={(member) => (selectedMemberRef.current = member)}
        sx={componentSx}
      />
    ),
    get requireSelectedMember(): MemberPublicInfo {
      if (!selectedMemberRef.current) {
        throw new Error("No member selected");
      }
      return selectedMemberRef.current;
    },
    clearSelection: (): void => {
      selectedMemberRef.current = null;
    },
  };
};

export default useMemberAutocomplete;
