import { SxProps, Theme } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useState } from "react";

import PromiseStatus from "@/components/ui/PromiseStatus";
import useMembers from "@/context/shared-data/useMembers";
import { MemberPublicInfo } from "@/model/dtos";
import { getFullNameAndUsername } from "@/pages/members/members-utils";
import { getCurrentYear } from "@/utils/date-utils";

type Props = {
  onChange: (value: MemberPublicInfo | null) => void;
  sx?: SxProps<Theme>;
};

const MemberAutocomplete: React.FC<Props> = ({ onChange, sx }) => {
  const members = useMembers(getCurrentYear());
  const [selected, setSelected] = useState<MemberPublicInfo | null>(null);

  const handleChange = (newValue: MemberPublicInfo | null): void => {
    setSelected(newValue);
    onChange(newValue);
  };

  if (!members.result) {
    return <PromiseStatus outcomes={[members]} />;
  }

  return (
    <Autocomplete
      options={members.result}
      value={selected}
      getOptionLabel={(member) => getFullNameAndUsername(member)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, newValue) => handleChange(newValue)}
      renderInput={(params) => (
        <TextField {...params} label="Member" required />
      )}
      sx={sx}
    />
  );
};

export default MemberAutocomplete;
