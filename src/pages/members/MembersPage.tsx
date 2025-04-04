import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import RowStack from "@/components/layout/RowStack";
import PageTitle from "@/components/ui/PageTitle";
import useDelay from "@/hooks/useDelay";
import dayjs from "@/utils/dayjs";
import { SEARCH_DELAY_MS } from "@/utils/search-utils";

import MembersDataGrid from "./MembersDataGrid";

const MembersPage = () => {
  const currentYear = dayjs().year();
  const [search, setSearch] = useState<string>("");

  const onSearch = useDelay(
    SEARCH_DELAY_MS,
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
  );

  return (
    <>
      <PageTitle value={`Active Members (${currentYear})`} />

      <RowStack wrap={false} compact={true} mt={2} mb={2}>
        <Typography>Search:</Typography>
        <TextField
          onChange={onSearch}
          variant="outlined"
          label="Name, username, phone..."
          size="small"
          sx={{
            width: 230,
          }}
          className="ycc-members-search-input"
        />
      </RowStack>

      <MembersDataGrid year={currentYear} search={search} />
    </>
  );
};

export default MembersPage;
