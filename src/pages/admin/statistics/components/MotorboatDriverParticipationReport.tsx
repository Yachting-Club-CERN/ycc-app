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

import { MemberPublicInfo } from "@/model/dtos";
import { HelperTask } from "@/model/helpers-dtos";
import { getFullName } from "@/pages/members/members-utils";
import { formatDate } from "@/utils/date-utils";
import dayjs from "@/utils/dayjs";

type TaskReference = {
  id: number;
  title: string;
  date: dayjs.Dayjs | null;
};

type MotorboatDriverParticipation = {
  memberId: number;
  fullName: string;
  taskCount: number;
  tasks: TaskReference[];
};

type MotorboatDriverData = {
  fullName: string;
  taskSet: Set<number>;
  tasks: TaskReference[];
};

const calculateMotorboatDriverParticipation = (
  tasks: HelperTask[],
): MotorboatDriverParticipation[] => {
  const driverMap = new Map<number, MotorboatDriverData>();

  const handleDriver = (task: HelperTask, member: MemberPublicInfo): void => {
    const memberId = member.id;
    const fullName = getFullName(member);

    let driverData = driverMap.get(memberId);
    if (!driverData) {
      driverData = {
        fullName,
        taskSet: new Set<number>(),
        tasks: [],
      };
      driverMap.set(memberId, driverData);
    }

    if (!driverData.taskSet.has(task.id)) {
      driverData.taskSet.add(task.id);
      driverData.tasks.push({
        id: task.id,
        title: task.title,
        date: task.startsAt || task.deadline,
      });
    }
  };

  for (const task of tasks) {
    if (
      task.captain &&
      task.captainRequiredLicenceInfo &&
      task.captainRequiredLicenceInfo.licence === "M"
    ) {
      handleDriver(task, task.captain.member);
    }
  }

  const participations: MotorboatDriverParticipation[] = Array.from(
    driverMap.entries(),
  ).map(([memberId, data]) => {
    const sortedTasks = [...data.tasks].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.valueOf() - b.date.valueOf();
    });

    return {
      memberId,
      fullName: data.fullName,
      taskCount: data.taskSet.size,
      tasks: sortedTasks,
    };
  });

  participations.sort((a, b) => {
    if (b.taskCount !== a.taskCount) {
      return b.taskCount - a.taskCount;
    }
    return a.fullName.localeCompare(b.fullName);
  });

  return participations;
};

type Props = {
  tasks: HelperTask[];
};

const MotorboatDriverParticipationReport: React.FC<Props> = ({ tasks }) => {
  const driverParticipation = useMemo(
    () => calculateMotorboatDriverParticipation(tasks),
    [tasks],
  );

  if (driverParticipation.length === 0) {
    return null;
  }

  const doubleCheck = driverParticipation.reduce(
    (acc, driver) => acc + driver.taskCount,
    0,
  );

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Motorboat Driver Participation</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography sx={{ mb: 2 }}>
          Total driver participations: {doubleCheck}
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Task Count</TableCell>
                <TableCell>Tasks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {driverParticipation.map((driver) => (
                <TableRow key={driver.memberId}>
                  <TableCell>{driver.fullName}</TableCell>
                  <TableCell align="right">{driver.taskCount}</TableCell>
                  <TableCell>
                    {driver.tasks.map((task) => (
                      <div key={task.id}>
                        <Link
                          component={RouterLink}
                          to={`/helpers/tasks/${task.id}`}
                        >
                          {task.title}
                          {task.date && ` (${formatDate(task.date)})`}
                        </Link>
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

export default MotorboatDriverParticipationReport;
