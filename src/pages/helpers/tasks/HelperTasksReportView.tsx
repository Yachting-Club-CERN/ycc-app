import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";

import SpacedTypography from "@/components/ui/SpacedTypography";
import { HelperTasks } from "@/model/helpers-dtos";

import { createTimingInfoLine } from "../helpers-format";
import { getTaskLocation } from "../helpers-utils";

type Props = {
  tasks: HelperTasks;
};

const HelperTasksReportView = ({ tasks }: Props) => {
  return (
    <>
      <SpacedTypography>
        This is a simple list of the filtered tasks, ready to be copied e.g.,
        into emails.
      </SpacedTypography>
      <ul>
        {tasks.map((task) => {
          const taskLocation = getTaskLocation(task.id);
          return (
            <li key={task.id}>
              <Link component={RouterLink} to={taskLocation}>
                {task.title} &mdash; {createTimingInfoLine(task)}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default HelperTasksReportView;
