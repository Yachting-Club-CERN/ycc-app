import TextField from "@mui/material/TextField";
import { useState } from "react";

import ReadingBoxLarge from "@/components/layout/ReadingBoxLarge";
import RowStack from "@/components/layout/RowStack";
import PageTitle from "@/components/ui/PageTitle";
import useDelay from "@/hooks/useDelay";
import { SEARCH_DELAY_MS } from "@/utils/constants";
import dayjs from "@/utils/dayjs";

import MembersDataGrid from "./MembersDataGrid";

const MemberListPage: React.FC = () => {
  const currentYear = dayjs().year();
  const [search, setSearch] = useState<string>("");

  const onSearch = useDelay(
    SEARCH_DELAY_MS,
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
  );

  return (
    <ReadingBoxLarge>
      <RowStack wrap={false} mb={2}>
        <PageTitle
          value={`Active Members (${currentYear})`}
          mobileValue="Members"
        />
        <TextField
          onChange={onSearch}
          variant="outlined"
          label="Name, username, phone..."
          size="small"
          sx={{ width: 230 }}
          className="ycc-members-search-input"
        />
      </RowStack>

      <MembersDataGrid year={currentYear} search={search} />
    </ReadingBoxLarge>
  );
};

export default MemberListPage;
