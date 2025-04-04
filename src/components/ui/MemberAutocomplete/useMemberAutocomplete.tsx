import { SxProps } from "@mui/material";
import { useRef } from "react";

import { MemberPublicInfo } from "@/model/dtos";

import MemberAutocomplete from "./MemberAutocomplete";

const useMemberAutocomplete = (componentSx?: SxProps) => {
  const selectedMemberRef = useRef<MemberPublicInfo | null>(null);

  return {
    component: (
      <MemberAutocomplete
        onChange={(member) => (selectedMemberRef.current = member)}
        sx={componentSx}
      />
    ),
    get requireSelectedMember() {
      if (!selectedMemberRef.current) {
        throw new Error("No member selected");
      }
      return selectedMemberRef.current;
    },
    clearSelection: () => {
      selectedMemberRef.current = null;
    },
  };
};

export default useMemberAutocomplete;
