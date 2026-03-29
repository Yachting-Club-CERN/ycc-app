import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

import { HelperTask } from "@/model/helpers-dtos";
import { statsSortByDate } from "@/pages/admin/statistics/statistics-utils";
import { getFullName } from "@/pages/members/members-utils";
import { formatDate } from "@/utils/date-utils";

const findSurveillanceTasksWithoutCaptain = (
  tasks: HelperTask[],
): HelperTask[] =>
  tasks
    .filter(
      (task) =>
        task.category.title.toLowerCase() === "surveillance" && !task.captain,
    )
    .sort(statsSortByDate);

const findUnpublishedTasks = (tasks: HelperTask[]): HelperTask[] =>
  tasks.filter((task) => !task.published).sort(statsSortByDate);

const findCancelledTasks = (tasks: HelperTask[]): HelperTask[] =>
  tasks
    .filter((task) => {
      const titleLower = task.title.toLowerCase();
      return (
        titleLower.includes("cancelled") || titleLower.includes("canceled")
      );
    })
    .sort(statsSortByDate);

const findTasksWithLicenceNotInSurveillance = (
  tasks: HelperTask[],
): HelperTask[] =>
  tasks
    .filter(
      (task) =>
        task.captainRequiredLicenceInfo &&
        task.category.title.toLowerCase() !== "surveillance",
    )
    .sort((a, b) => {
      const licenceCmp = a.captainRequiredLicenceInfo!.licence.localeCompare(
        b.captainRequiredLicenceInfo!.licence,
      );
      if (licenceCmp !== 0) return licenceCmp;
      return statsSortByDate(a, b);
    });

type TaskTableColumn = {
  label: string;
  getValue: (task: HelperTask) => React.ReactNode;
};

type TaskTableProps = {
  tasks: HelperTask[];
  columns: TaskTableColumn[];
};

const TaskTable = ({ tasks, columns }: TaskTableProps): React.ReactNode => (
  <TableContainer component={Paper} sx={{ mb: 3 }}>
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableCell key={col.label}>{col.label}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            {columns.map((col) => (
              <TableCell key={col.label}>{col.getValue(task)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const baseColumns: TaskTableColumn[] = [
  {
    label: "Task",
    getValue: (task) => (
      <Link component={RouterLink} to={`/helpers/tasks/${task.id}`}>
        {task.title}
      </Link>
    ),
  },
];

const dateColumn: TaskTableColumn = {
  label: "Date",
  getValue: (task) =>
    task.startsAt || task.deadline
      ? formatDate(task.startsAt || task.deadline)
      : "N/A",
};

const categoryColumn: TaskTableColumn = {
  label: "Category",
  getValue: (task) => task.category.title,
};

const contactColumn: TaskTableColumn = {
  label: "Contact",
  getValue: (task) => getFullName(task.contact),
};

const licenceColumn: TaskTableColumn = {
  label: "Required Licence",
  getValue: (task) => task.captainRequiredLicenceInfo?.licence || "N/A",
};

type Props = {
  publishedTasks: HelperTask[];
  allTasks: HelperTask[];
};

const TroubleshootingReport = ({
  publishedTasks,
  allTasks,
}: Props): React.ReactNode => {
  const surveillanceTasksWithoutCaptain = useMemo(
    () => findSurveillanceTasksWithoutCaptain(publishedTasks),
    [publishedTasks],
  );

  const unpublishedTasks = useMemo(
    () => findUnpublishedTasks(allTasks),
    [allTasks],
  );

  const cancelledTasks = useMemo(
    () => findCancelledTasks(allTasks),
    [allTasks],
  );

  const tasksWithLicenceNotInSurveillance = useMemo(
    () => findTasksWithLicenceNotInSurveillance(allTasks),
    [allTasks],
  );

  return (
    <>
      {surveillanceTasksWithoutCaptain.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Surveillance tasks without a captain (
              {surveillanceTasksWithoutCaptain.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TaskTable
              tasks={surveillanceTasksWithoutCaptain}
              columns={[...baseColumns, dateColumn, contactColumn]}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {unpublishedTasks.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Unpublished tasks ({unpublishedTasks.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TaskTable
              tasks={unpublishedTasks}
              columns={[
                ...baseColumns,
                categoryColumn,
                dateColumn,
                contactColumn,
              ]}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {cancelledTasks.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Cancelled tasks ({cancelledTasks.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TaskTable
              tasks={cancelledTasks}
              columns={[
                ...baseColumns,
                categoryColumn,
                dateColumn,
                contactColumn,
              ]}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {tasksWithLicenceNotInSurveillance.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Tasks with required licence but not in Surveillance (
              {tasksWithLicenceNotInSurveillance.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TaskTable
              tasks={tasksWithLicenceNotInSurveillance}
              columns={[
                ...baseColumns,
                categoryColumn,
                licenceColumn,
                dateColumn,
                contactColumn,
              ]}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};

export default TroubleshootingReport;
