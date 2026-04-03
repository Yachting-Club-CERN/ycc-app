import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

import { HelperTask } from "@/model/helpers-dtos";
import { getFullName } from "@/pages/members/members-utils";

type ContactStats = {
  memberId: number;
  fullName: string;
  taskCount: number;
};

type ContactData = {
  fullName: string;
  taskCount: number;
};

const calculateContactStatistics = (tasks: HelperTask[]): ContactStats[] => {
  const contactMap = new Map<number, ContactData>();

  for (const task of tasks) {
    const memberId = task.contact.id;
    const fullName = getFullName(task.contact);

    const existing = contactMap.get(memberId);
    if (existing) {
      existing.taskCount += 1;
    } else {
      contactMap.set(memberId, { fullName, taskCount: 1 });
    }
  }

  const stats: ContactStats[] = Array.from(contactMap.entries()).map(
    ([memberId, data]) => ({
      memberId,
      ...data,
    }),
  );

  stats.sort((a, b) => {
    if (b.taskCount !== a.taskCount) {
      return b.taskCount - a.taskCount;
    }
    return a.fullName.localeCompare(b.fullName);
  });

  return stats;
};

type Props = {
  tasks: HelperTask[];
};

const ContactStatisticsReport = ({ tasks }: Props): React.ReactNode => {
  const contactStatistics = useMemo(
    () => calculateContactStatistics(tasks),
    [tasks],
  );

  if (contactStatistics.length === 0) {
    return null;
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Contact Statistics</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Task Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contactStatistics.map((contact) => (
                <TableRow key={contact.memberId}>
                  <TableCell>{contact.fullName}</TableCell>
                  <TableCell align="right">{contact.taskCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

export default ContactStatisticsReport;
