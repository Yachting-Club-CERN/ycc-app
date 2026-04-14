import Typography from "@mui/material/Typography";

import ReadingBox from "@/components/layout/ReadingBox";
import ReadingBoxXL from "@/components/layout/ReadingBoxXL";
import PromiseStatus from "@/components/ui/PromiseStatus";
import HelperTaskCardGrid from "@/pages/helpers/components/HelperTaskCardGrid";
import { FilteredHelperTasks } from "@/pages/helpers/useFilteredHelperTasks";

import HelperTasksDataGrid from "./HelperTasksDataGrid";
import HelperTasksReportView from "./HelperTasksReportView";
import { HelperTasksDisplay } from "./types";

type Props = {
  display: HelperTasksDisplay;
  filteredTasks: FilteredHelperTasks;
};

const HelperTasksView = ({
  display,
  filteredTasks,
}: Props): React.ReactNode => {
  return (
    <>
      {filteredTasks.result?.length === 0 && (
        <ReadingBox>
          <Typography color="text.secondary" mt={2} mb={2}>
            No tasks match the current filters.
          </Typography>
        </ReadingBox>
      )}
      {filteredTasks.result && filteredTasks.result.length > 0 && (
        <>
          {display === "data-grid" && (
            <ReadingBoxXL>
              <HelperTasksDataGrid tasks={filteredTasks.result} />
            </ReadingBoxXL>
          )}
          {display === "cards" && (
            <ReadingBox>
              <HelperTaskCardGrid tasks={filteredTasks.result} />
            </ReadingBox>
          )}
          {display === "report" && (
            <ReadingBox>
              <HelperTasksReportView tasks={filteredTasks.result} />
            </ReadingBox>
          )}
        </>
      )}

      <ReadingBox>
        <PromiseStatus outcomes={[filteredTasks]} />
      </ReadingBox>
    </>
  );
};

export default HelperTasksView;
