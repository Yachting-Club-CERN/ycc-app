import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import PageTitle from "@/components/PageTitle";
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
      <PageTitle
        value={`Active Members (${currentYear})`}
        mobileValue={`Members (${currentYear})`}
      />

      <Stack direction="row" alignItems="center" spacing={1} mt={2} mb={2}>
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
      </Stack>

      <MembersDataGrid year={currentYear} search={search} />
    </>
  );
};

export default MembersPage;
