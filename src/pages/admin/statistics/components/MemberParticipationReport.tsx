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

const MIN_TASKS_TO_DISPLAY = 3;

type TaskReference = {
  id: number;
  title: string;
  date: dayjs.Dayjs | null;
};

type MemberParticipation = {
  memberId: number;
  fullName: string;
  taskCount: number;
  tasks: TaskReference[];
};

type MemberData = {
  fullName: string;
  taskSet: Set<number>;
  tasks: TaskReference[];
};

const calculateMemberParticipation = (
  tasks: HelperTask[],
): MemberParticipation[] => {
  const memberMap = new Map<number, MemberData>();

  const handleMember = (task: HelperTask, member: MemberPublicInfo): void => {
    const memberId = member.id;
    const fullName = getFullName(member);

    let memberData = memberMap.get(memberId);
    if (!memberData) {
      memberData = {
        fullName,
        taskSet: new Set<number>(),
        tasks: [],
      };
      memberMap.set(memberId, memberData);
    }

    // Only add task if not already counted (handles case where person is both captain and helper)
    if (!memberData.taskSet.has(task.id)) {
      memberData.taskSet.add(task.id);
      memberData.tasks.push({
        id: task.id,
        title: task.title,
        date: task.startsAt || task.deadline,
      });
    }
  };

  for (const task of tasks) {
    if (task.captain) {
      handleMember(task, task.captain.member);
    }

    for (const helper of task.helpers) {
      handleMember(task, helper.member);
    }
  }

  // Convert to array, filter for min tasks, and sort
  const participations: MemberParticipation[] = Array.from(memberMap.entries())
    .map(([memberId, data]) => {
      // Sort tasks by date
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
    })
    .filter((p) => p.taskCount >= MIN_TASKS_TO_DISPLAY);

  // Sort by task count descending, then by name ascending
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

const MemberParticipationReport: React.FC<Props> = ({ tasks }) => {
  const memberParticipation = useMemo(() => {
    return calculateMemberParticipation(tasks);
  }, [tasks]);

  if (memberParticipation.length === 0) {
    return null;
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">
          Member Participation ({MIN_TASKS_TO_DISPLAY}+ Tasks)
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
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
              {memberParticipation.map((member) => (
                <TableRow key={member.memberId}>
                  <TableCell>{member.fullName}</TableCell>
                  <TableCell align="right">{member.taskCount}</TableCell>
                  <TableCell>
                    {member.tasks.map((task) => (
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

export default MemberParticipationReport;
