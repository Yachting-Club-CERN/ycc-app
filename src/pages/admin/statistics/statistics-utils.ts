import dayjs from "@/utils/dayjs";

export const statsSortByDate = (
  a: { startsAt: dayjs.Dayjs | null; deadline: dayjs.Dayjs | null },
  b: { startsAt: dayjs.Dayjs | null; deadline: dayjs.Dayjs | null },
): number => {
  const dateA = a.startsAt || a.deadline;
  const dateB = b.startsAt || b.deadline;
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateA.valueOf() - dateB.valueOf();
};
