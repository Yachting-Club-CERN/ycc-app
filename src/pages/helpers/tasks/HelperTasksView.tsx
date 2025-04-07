import ReadingBox from "@/components/layout/ReadingBox";
import ReadingBoxXL from "@/components/layout/ReadingBoxXL";
import PromiseStatus from "@/components/ui/PromiseStatus";

import HelperTaskCardGrid from "../components/HelperTaskCardGrid";
import {
  HelperTaskFilterOptions,
  useFilteredHelperTasks,
} from "../useFilteredHelperTasks";
import HelperTasksDataGrid from "./HelperTasksDataGrid";
import HelperTasksReportView from "./HelperTasksReportView";
import { HelperTasksDisplay } from "./types";

type Props = {
  display: HelperTasksDisplay;
  filterOptions: HelperTaskFilterOptions;
};

const HelperTasksView = ({ display, filterOptions }: Props) => {
  const filteredTasks = useFilteredHelperTasks(filterOptions);

  return (
    <>
      {filteredTasks.result && (
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
