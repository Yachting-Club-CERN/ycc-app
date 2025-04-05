import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";

import SpacedTypography from "@/components/ui/SpacedTypography";
import { HelperTasks } from "@/model/helpers-dtos";

import { createTimingInfoLine } from "../helpers-format";
import { getTaskLocation } from "../helpers-utils";

type Props = {
  tasks: HelperTasks;
};

const HelperTasksReportView = ({ tasks }: Props) => {
  const navigate = useNavigate();

  const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    await navigate(event.currentTarget.href);
  };

  return (
    <>
      <SpacedTypography>
        This is a simple list of the filtered tasks, ready to be copied into
        e.g., emails.
      </SpacedTypography>
      <ul>
        {tasks.map((task) => {
          const taskLocation = getTaskLocation(task.id);
          return (
            <li key={task.id}>
              <Link
                /* This is needed so we get a clickable link during copy-paste. */
                href={taskLocation}
                /* This is needed to avoid complete page reload on navigation. */
                onClick={handleClick}
              >
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
