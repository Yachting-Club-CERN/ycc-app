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

import { useYearSelector } from "@/components/input/YearSelector";
import ReadingBoxLarge from "@/components/layout/ReadingBoxLarge";
import SpacedBox from "@/components/layout/SpacedBox";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { useNavigate } from "@/hooks/useNavigate";
import usePromise from "@/hooks/usePromise";
import { HelperTask } from "@/model/helpers-dtos";
import client from "@/utils/client";
import { formatDate, getCurrentYear } from "@/utils/date-utils";
import dayjs from "@/utils/dayjs";

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
  totals: {
    taskCount: number;
    captainCount: number;
    helpersCount: number;
    totalHelp: number;
  };
};

type MemberParticipation = {
  memberId: number;
  memberName: string;
  taskCount: number;
  tasks: Array<{
    id: number;
    title: string;
    date: dayjs.Dayjs | null;
  }>;
};

const getCategoryGroupName = (categoryTitle: string): string => {
  const lower = categoryTitle.toLowerCase();

  if (lower.startsWith("maintenance") || lower === "software / hardware") {
    return "Maintenance";
  }

  return categoryTitle;
};

const calculateOverallStatistics = (
  tasks: HelperTask[],
): { groups: GroupStats[]; allDistinctMembers: number } => {
  const categoryMap = new Map<string, CategoryStats>();
  const allDistinctMembers = new Set<number>();

  tasks.forEach((task) => {
    const categoryTitle = task.category.title;

    if (!categoryMap.has(categoryTitle)) {
      categoryMap.set(categoryTitle, {
        categoryTitle,
        taskCount: 0,
        captainCount: 0,
        helpersCount: 0,
        totalHelp: 0,
        distinctMembers: new Set<number>(),
      });
    }

    const stats = categoryMap.get(categoryTitle)!;
    stats.taskCount += 1;

    // Count captain
    if (task.captain) {
      stats.captainCount += 1;
      stats.distinctMembers.add(task.captain.member.id);
      allDistinctMembers.add(task.captain.member.id);
    }

    // Count helpers
    task.helpers.forEach((helper) => {
      stats.helpersCount += 1;
      stats.distinctMembers.add(helper.member.id);
      allDistinctMembers.add(helper.member.id);
    });

    // Total help = captains + helpers
    stats.totalHelp = stats.captainCount + stats.helpersCount;
  });

  // Group categories
  const groupMap = new Map<string, CategoryStats[]>();
  Array.from(categoryMap.values()).forEach((cat) => {
    const groupName = getCategoryGroupName(cat.categoryTitle);
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, []);
    }
    groupMap.get(groupName)!.push(cat);
  });

  // Calculate group totals
  const groups: GroupStats[] = Array.from(groupMap.entries()).map(
    ([groupName, categories]) => {
      return {
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
      };
    },
  );

  return {
    groups,
    allDistinctMembers: allDistinctMembers.size,
  };
};

const calculateMemberParticipation = (
  tasks: HelperTask[],
): MemberParticipation[] => {
  const memberMap = new Map<
    number,
    {
      name: string;
      taskSet: Set<number>;
      tasks: Array<{ id: number; title: string; date: dayjs.Dayjs | null }>;
    }
  >();

  tasks.forEach((task) => {
    const addMember = (memberId: number, memberName: string): void => {
      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          name: memberName,
          taskSet: new Set<number>(),
          tasks: [],
        });
      }
      const member = memberMap.get(memberId)!;
      // Only add task if not already counted (handles case where person is both captain and helper)
      if (!member.taskSet.has(task.id)) {
        member.taskSet.add(task.id);
        const date = task.startsAt || task.deadline;
        member.tasks.push({ id: task.id, title: task.title, date });
      }
    };

    // Add captain
    if (task.captain) {
      const member = task.captain.member;
      const name = `${member.firstName} ${member.lastName}`;
      addMember(member.id, name);
    }

    // Add helpers
    task.helpers.forEach((helper) => {
      const member = helper.member;
      const name = `${member.firstName} ${member.lastName}`;
      addMember(member.id, name);
    });
  });

  // Convert to array, filter for min 3 tasks, and sort
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
        memberName: data.name,
        taskCount: data.taskSet.size,
        tasks: sortedTasks,
      };
    })
    .filter((p) => p.taskCount >= 3);

  // Sort by task count descending, then by name ascending
  participations.sort((a, b) => {
    if (b.taskCount !== a.taskCount) {
      return b.taskCount - a.taskCount;
    }
    return a.memberName.localeCompare(b.memberName);
  });

  return participations;
};

const findSurveillanceTasksWithoutCaptain = (
  tasks: HelperTask[],
): HelperTask[] => {
  return tasks
    .filter(
      (task) =>
        task.category.title.toLowerCase() === "surveillance" && !task.captain,
    )
    .sort((a, b) => {
      const dateA = a.startsAt || a.deadline;
      const dateB = b.startsAt || b.deadline;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.valueOf() - dateB.valueOf();
    });
};

const findCancelledTasks = (tasks: HelperTask[]): HelperTask[] => {
  return tasks
    .filter((task) => {
      const titleLower = task.title.toLowerCase();
      return (
        titleLower.includes("cancelled") || titleLower.includes("canceled")
      );
    })
    .sort((a, b) => {
      const dateA = a.startsAt || a.deadline;
      const dateB = b.startsAt || b.deadline;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.valueOf() - dateB.valueOf();
    });
};

type ContactStats = {
  memberId: number;
  memberName: string;
  taskCount: number;
};

const calculateContactStatistics = (tasks: HelperTask[]): ContactStats[] => {
  const contactMap = new Map<number, { name: string; count: number }>();

  tasks.forEach((task) => {
    const contactId = task.contact.id;
    const contactName = `${task.contact.firstName} ${task.contact.lastName}`;

    if (!contactMap.has(contactId)) {
      contactMap.set(contactId, { name: contactName, count: 0 });
    }
    contactMap.get(contactId)!.count += 1;
  });

  const stats: ContactStats[] = Array.from(contactMap.entries()).map(
    ([memberId, data]) => ({
      memberId,
      memberName: data.name,
      taskCount: data.count,
    }),
  );

  // Sort by task count descending, then by name ascending
  stats.sort((a, b) => {
    if (b.taskCount !== a.taskCount) {
      return b.taskCount - a.taskCount;
    }
    return a.memberName.localeCompare(b.memberName);
  });

  return stats;
};

const findTasksWithLicenseNotInSurveillance = (
  tasks: HelperTask[],
): HelperTask[] => {
  return tasks
    .filter(
      (task) =>
        task.captainRequiredLicenceInfo &&
        task.category.title.toLowerCase() !== "surveillance",
    )
    .sort((a, b) => {
      const dateA = a.startsAt || a.deadline;
      const dateB = b.startsAt || b.deadline;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.valueOf() - dateB.valueOf();
    });
};

const StatisticsPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const yearSelector = useYearSelector({ initialYear: getCurrentYear() });

  if (!currentUser.helpersAppAdmin) {
    void navigate("/");
  }

  const allTasks = usePromise(
    () => client.helpers.getTasks(yearSelector.selectedYearForApi),
    [yearSelector.selectedYearForApi],
  );

  const tasks = useMemo(() => {
    if (!allTasks.result) return null;
    return allTasks.result.filter((task) => task.published);
  }, [allTasks.result]);

  const unpublishedTasks = useMemo(() => {
    if (!allTasks.result) return null;
    return allTasks.result
      .filter((task) => !task.published)
      .sort((a, b) => {
        const dateA = a.startsAt || a.deadline;
        const dateB = b.startsAt || b.deadline;
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.valueOf() - dateB.valueOf();
      });
  }, [allTasks.result]);

  const statistics = useMemo(() => {
    if (!tasks) return null;
    return calculateOverallStatistics(tasks);
  }, [tasks]);

  const memberParticipation = useMemo(() => {
    if (!tasks) return null;
    return calculateMemberParticipation(tasks);
  }, [tasks]);

  const surveillanceTasksWithoutCaptain = useMemo(() => {
    if (!tasks) return null;
    return findSurveillanceTasksWithoutCaptain(tasks);
  }, [tasks]);

  const cancelledTasks = useMemo(() => {
    if (!allTasks.result) return null;
    return findCancelledTasks(allTasks.result);
  }, [allTasks.result]);

  const contactStatistics = useMemo(() => {
    if (!tasks) return null;
    return calculateContactStatistics(tasks);
  }, [tasks]);

  const tasksWithLicenseNotInSurveillance = useMemo(() => {
    if (!allTasks.result) return null;
    return findTasksWithLicenseNotInSurveillance(allTasks.result);
  }, [allTasks.result]);

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    if (!statistics) return null;
    return statistics.groups.reduce(
      (acc, group) => ({
        taskCount: acc.taskCount + group.totals.taskCount,
        captainCount: acc.captainCount + group.totals.captainCount,
        helpersCount: acc.helpersCount + group.totals.helpersCount,
        totalHelp: acc.totalHelp + group.totals.totalHelp,
      }),
      { taskCount: 0, captainCount: 0, helpersCount: 0, totalHelp: 0 },
    );
  }, [statistics]);

  return (
    <ReadingBoxLarge>
      <PageTitle value="Statistics" />

      <SpacedBox>{yearSelector.component}</SpacedBox>

      {statistics && grandTotals && (
        <SpacedBox>
          <Typography variant="h3" gutterBottom>
            Overall Statistics
          </Typography>

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
                  <>
                    {group.categories.map((cat, index) => (
                      <TableRow key={cat.categoryTitle}>
                        <TableCell
                          sx={
                            index === group.categories.length - 1
                              ? { borderBottom: "2px solid #ddd" }
                              : {}
                          }
                        >
                          {cat.categoryTitle}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={
                            index === group.categories.length - 1
                              ? { borderBottom: "2px solid #ddd" }
                              : {}
                          }
                        >
                          {cat.taskCount}
                        </TableCell>
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
                        <TableCell
                          align="right"
                          sx={
                            index === group.categories.length - 1
                              ? { borderBottom: "2px solid #ddd" }
                              : {}
                          }
                        >
                          {cat.helpersCount}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={
                            index === group.categories.length - 1
                              ? { borderBottom: "2px solid #ddd" }
                              : {}
                          }
                        >
                          {cat.totalHelp}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: "#fff3e0" }}>
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
                  </>
                ))}
                <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
                  <TableCell>
                    <strong>Grand Total</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{grandTotals.taskCount}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{grandTotals.captainCount}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{grandTotals.helpersCount}</strong>
                  </TableCell>
                  <TableCell align="right" sx={{ backgroundColor: "#c8e6c9" }}>
                    <strong>{grandTotals.totalHelp}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <SpacedBox>
            <strong>
              {statistics.allDistinctMembers} distinct members helped
            </strong>
          </SpacedBox>
        </SpacedBox>
      )}

      {memberParticipation && (
        <SpacedBox>
          <Typography variant="h3" gutterBottom>
            Member Participation (3+ Tasks)
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
                {memberParticipation.map((member) => (
                  <TableRow key={member.memberId}>
                    <TableCell>{member.memberName}</TableCell>
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
        </SpacedBox>
      )}

      {contactStatistics && (
        <SpacedBox>
          <Typography variant="h3" gutterBottom>
            Contact Statistics
          </Typography>
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
                    <TableCell>{contact.memberName}</TableCell>
                    <TableCell align="right">{contact.taskCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SpacedBox>
      )}

      {((surveillanceTasksWithoutCaptain &&
        surveillanceTasksWithoutCaptain.length > 0) ||
        (unpublishedTasks && unpublishedTasks.length > 0) ||
        (cancelledTasks && cancelledTasks.length > 0) ||
        (tasksWithLicenseNotInSurveillance &&
          tasksWithLicenseNotInSurveillance.length > 0)) && (
        <SpacedBox>
          <Typography variant="h3" gutterBottom>
            Troubleshooting
          </Typography>

          {surveillanceTasksWithoutCaptain &&
            surveillanceTasksWithoutCaptain.length > 0 && (
              <>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  Surveillance tasks without a captain (
                  {surveillanceTasksWithoutCaptain.length})
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Contact</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {surveillanceTasksWithoutCaptain.map((task) => {
                        const date = task.startsAt || task.deadline;
                        const contactName = `${task.contact.firstName} ${task.contact.lastName}`;
                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <Link
                                component={RouterLink}
                                to={`/helpers/tasks/${task.id}`}
                              >
                                {task.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {date ? formatDate(date) : "No date"}
                            </TableCell>
                            <TableCell>{contactName}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

          {unpublishedTasks && unpublishedTasks.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Unpublished tasks ({unpublishedTasks.length})
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Contact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unpublishedTasks.map((task) => {
                      const date = task.startsAt || task.deadline;
                      const contactName = `${task.contact.firstName} ${task.contact.lastName}`;
                      return (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Link
                              component={RouterLink}
                              to={`/helpers/tasks/${task.id}`}
                            >
                              {task.title}
                            </Link>
                          </TableCell>
                          <TableCell>{task.category.title}</TableCell>
                          <TableCell>
                            {date ? formatDate(date) : "No date"}
                          </TableCell>
                          <TableCell>{contactName}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {cancelledTasks && cancelledTasks.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Cancelled tasks ({cancelledTasks.length})
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Contact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cancelledTasks.map((task) => {
                      const date = task.startsAt || task.deadline;
                      const contactName = `${task.contact.firstName} ${task.contact.lastName}`;
                      return (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Link
                              component={RouterLink}
                              to={`/helpers/tasks/${task.id}`}
                            >
                              {task.title}
                            </Link>
                          </TableCell>
                          <TableCell>{task.category.title}</TableCell>
                          <TableCell>
                            {date ? formatDate(date) : "No date"}
                          </TableCell>
                          <TableCell>{contactName}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {tasksWithLicenseNotInSurveillance &&
            tasksWithLicenseNotInSurveillance.length > 0 && (
              <>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  Tasks with required license but not in Surveillance category (
                  {tasksWithLicenseNotInSurveillance.length})
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Required License</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Contact</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tasksWithLicenseNotInSurveillance.map((task) => {
                        const date = task.startsAt || task.deadline;
                        const contactName = `${task.contact.firstName} ${task.contact.lastName}`;
                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <Link
                                component={RouterLink}
                                to={`/helpers/tasks/${task.id}`}
                              >
                                {task.title}
                              </Link>
                            </TableCell>
                            <TableCell>{task.category.title}</TableCell>
                            <TableCell>
                              {task.captainRequiredLicenceInfo?.licence ||
                                "N/A"}
                            </TableCell>
                            <TableCell>
                              {date ? formatDate(date) : "No date"}
                            </TableCell>
                            <TableCell>{contactName}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
        </SpacedBox>
      )}

      <PromiseStatus outcomes={[allTasks]} />
    </ReadingBoxLarge>
  );
};

export default StatisticsPage;
