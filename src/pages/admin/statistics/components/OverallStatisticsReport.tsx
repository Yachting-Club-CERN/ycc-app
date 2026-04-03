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
import React, { useMemo } from "react";

import { HelperTask } from "@/model/helpers-dtos";

type CategoryStats = {
  categoryTitle: string;
  taskCount: number;
  captainCount: number;
  helpersCount: number;
  totalHelp: number;
  distinctMembers: Set<number>;
};

type GroupStats = {
  groupName: string;
  categories: CategoryStats[];
  totals: GroupTotals;
};

type GroupTotals = {
  taskCount: number;
  captainCount: number;
  helpersCount: number;
  totalHelp: number;
};

type OverallStatistics = {
  groups: GroupStats[];
  allDistinctMembers: number;
  grandTotals: GroupTotals;
};

const getCategoryGroupName = (categoryTitle: string): string => {
  const lower = categoryTitle.toLowerCase();

  if (lower.startsWith("maintenance") || lower === "software / hardware") {
    return "Maintenance";
  }

  return categoryTitle;
};

const calculateOverallStatistics = (tasks: HelperTask[]): OverallStatistics => {
  const categoryMap = new Map<string, CategoryStats>();
  const allDistinctMembers = new Set<number>();

  for (const task of tasks) {
    const categoryTitle = task.category.title;

    let stats = categoryMap.get(categoryTitle);
    if (!stats) {
      stats = {
        categoryTitle,
        taskCount: 0,
        captainCount: 0,
        helpersCount: 0,
        totalHelp: 0,
        distinctMembers: new Set<number>(),
      };
      categoryMap.set(categoryTitle, stats);
    }
    stats.taskCount += 1;

    allDistinctMembers.add(task.contact.id);

    if (task.captain) {
      stats.captainCount += 1;
      stats.distinctMembers.add(task.captain.member.id);
      allDistinctMembers.add(task.captain.member.id);
    }

    for (const helper of task.helpers) {
      stats.helpersCount += 1;
      stats.distinctMembers.add(helper.member.id);
      allDistinctMembers.add(helper.member.id);
    }
  }

  // Update totalHelp after all counting is done
  for (const stats of categoryMap.values()) {
    stats.totalHelp = stats.captainCount + stats.helpersCount;
  }

  // Group categories
  const groupMap = new Map<string, CategoryStats[]>();
  for (const cat of categoryMap.values()) {
    const groupName = getCategoryGroupName(cat.categoryTitle);
    const group = groupMap.get(groupName);
    if (group) {
      group.push(cat);
    } else {
      groupMap.set(groupName, [cat]);
    }
  }

  // Calculate group totals
  const groups: GroupStats[] = Array.from(groupMap.entries()).map(
    ([groupName, categories]) => ({
      groupName,
      categories,
      totals: {
        taskCount: categories.reduce((sum, cat) => sum + cat.taskCount, 0),
        captainCount: categories.reduce(
          (sum, cat) => sum + cat.captainCount,
          0,
        ),
        helpersCount: categories.reduce(
          (sum, cat) => sum + cat.helpersCount,
          0,
        ),
        totalHelp: categories.reduce((sum, cat) => sum + cat.totalHelp, 0),
      },
    }),
  );

  // Calculate grand totals
  const grandTotals = groups.reduce(
    (acc, group) => ({
      taskCount: acc.taskCount + group.totals.taskCount,
      captainCount: acc.captainCount + group.totals.captainCount,
      helpersCount: acc.helpersCount + group.totals.helpersCount,
      totalHelp: acc.totalHelp + group.totals.totalHelp,
    }),
    { taskCount: 0, captainCount: 0, helpersCount: 0, totalHelp: 0 },
  );

  return {
    groups,
    allDistinctMembers: allDistinctMembers.size,
    grandTotals,
  };
};

type Props = {
  tasks: HelperTask[];
};

const OverallStatisticsReport = ({ tasks }: Props): React.ReactNode => {
  const statistics = useMemo(() => {
    return calculateOverallStatistics(tasks);
  }, [tasks]);

  if (statistics.groups.length === 0) {
    return null;
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Overall Statistics</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell align="right">Task Count</TableCell>
                <TableCell align="right">Captain Count</TableCell>
                <TableCell align="right">Helper Count</TableCell>
                <TableCell align="right">Captains + Helpers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statistics.groups.map((group) => (
                <React.Fragment key={group.groupName}>
                  {group.categories.map((cat, index) => (
                    <TableRow key={cat.categoryTitle}>
                      <TableCell>{cat.categoryTitle}</TableCell>
                      <TableCell align="right">{cat.taskCount}</TableCell>
                      <TableCell
                        align="right"
                        sx={
                          index === group.categories.length - 1
                            ? { borderBottom: "2px solid #ddd" }
                            : {}
                        }
                      >
                        {cat.captainCount}
                      </TableCell>
                      <TableCell align="right">{cat.helpersCount}</TableCell>
                      <TableCell align="right">{cat.totalHelp}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: "warning.light" }}>
                    <TableCell>
                      <strong>{group.groupName} Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{group.totals.taskCount}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{group.totals.captainCount}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{group.totals.helpersCount}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{group.totals.totalHelp}</strong>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
              <TableRow sx={{ backgroundColor: "success.light" }}>
                <TableCell>
                  <strong>Grand Total</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{statistics.grandTotals.taskCount}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{statistics.grandTotals.captainCount}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{statistics.grandTotals.helpersCount}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{statistics.grandTotals.totalHelp}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography sx={{ mt: 2 }}>
          <strong>
            {statistics.allDistinctMembers} distinct members helped (including
            contacts)
          </strong>
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default OverallStatisticsReport;
