import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";

import RowStack from "@/components/layout/RowStack";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import SpacedTypography from "@/components/ui/SpacedTypography";
import useCurrentUser from "@/context/auth/useCurrentUser";
import useDelayedState from "@/hooks/useDelayedState";
import { HelperTaskState } from "@/model/helpers-dtos";
import HelperTaskCardGrid from "@/pages/helpers/components/HelperTaskCardGrid";
import {
  HelperTaskFilterOptions,
  useFilteredHelperTasks,
} from "@/pages/helpers/useFilteredHelperTasks";
import { SEARCH_DELAY_MS } from "@/utils/constants";
import { getCurrentYear } from "@/utils/date-utils";

const MyTasksView = (): React.ReactNode => {
  const [
    filterOptions,
    delayedFilterOptions,
    setFilterOptionsImmediately,
    setFilterOptionsWithDelay,
  ] = useDelayedState<HelperTaskFilterOptions>(
    () => ({
      year: getCurrentYear(),
      showOnlyContactOrSignedUp: true,
      states: [HelperTaskState.Pending, HelperTaskState.Done],
    }),
    SEARCH_DELAY_MS,
  );

  const user = useCurrentUser();
  const tasks = useFilteredHelperTasks(delayedFilterOptions);

  const showSearch = user.helpersAppAdminOrEditor;

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>): void =>
    setFilterOptionsWithDelay({
      ...filterOptions,
      search: event.target.value,
    });

  return (
    <>
      <PageTitle value="My Tasks" />

      {showSearch && (
        <RowStack wrap={true} compact={true} mb={2}>
          <TextField
            value={filterOptions.search}
            onChange={onSearch}
            variant="outlined"
            label="Search..."
            size="small"
            sx={{ width: 200 }}
            className="ycc-my-tasks-search-input"
          />

          <FormControlLabel
            control={
              <Switch
                onChange={(_, checked) => {
                  setFilterOptionsImmediately({
                    ...filterOptions,
                    states: checked
                      ? [
                          HelperTaskState.Pending,
                          HelperTaskState.Done,
                          HelperTaskState.Validated,
                        ]
                      : [HelperTaskState.Pending, HelperTaskState.Done],
                  });
                }}
              />
            }
            label="Show Validated Tasks"
          />
        </RowStack>
      )}

      {tasks.result && tasks.result.length > 0 && (
        <HelperTaskCardGrid tasks={tasks.result} />
      )}
      {tasks.result && tasks.result.length === 0 && (
        <SpacedTypography>
          {showSearch ? "No tasks to display." : "You have no tasks yet. 😢"}
        </SpacedTypography>
      )}

      <PromiseStatus outcomes={[tasks]} />
    </>
  );
};

export default MyTasksView;
