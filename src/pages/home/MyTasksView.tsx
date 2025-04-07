import TextField from "@mui/material/TextField";

import RowStack from "@/components/layout/RowStack";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import SpacedTypography from "@/components/ui/SpacedTypography";
import useCurrentUser from "@/context/auth/useCurrentUser";
import useDelayedState from "@/hooks/useDelayedState";
import { SEARCH_DELAY_MS } from "@/utils/constants";
import { getCurrentYear } from "@/utils/date-utils";

import HelperTaskCardGrid from "../helpers/components/HelperTaskCardGrid";
import {
  HelperTaskFilterOptions,
  useFilteredHelperTasks,
} from "../helpers/useFilteredHelperTasks";

const MyTasksView = () => {
  const [filterOptions, delayedFilterOptions, , setFilterOptionsWithDelay] =
    useDelayedState<HelperTaskFilterOptions>(
      () => ({
        year: getCurrentYear(),
        showOnlyContactOrSignedUp: true,
      }),
      SEARCH_DELAY_MS,
    );

  const user = useCurrentUser();
  const tasks = useFilteredHelperTasks(delayedFilterOptions);

  const showSearch = user.helpersAppAdminOrEditor;

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptionsWithDelay({
      ...filterOptions,
      search: event.target.value,
    });
  };

  return (
    <>
      <RowStack wrap={false} mb={2}>
        <PageTitle value="My Tasks" />
        {showSearch && (
          <TextField
            value={filterOptions.search}
            onChange={onSearch}
            variant="outlined"
            label="Search..."
            size="small"
            sx={{
              width: 200,
            }}
            className="ycc-members-search-input"
          />
        )}
      </RowStack>

      {tasks.result && tasks.result.length > 0 && (
        <HelperTaskCardGrid tasks={tasks.result} />
      )}
      {tasks.result && tasks.result.length === 0 && (
        <SpacedTypography>You have no tasks yet. 😢</SpacedTypography>
      )}

      <PromiseStatus outcomes={[tasks]} />
    </>
  );
};

export default MyTasksView;
