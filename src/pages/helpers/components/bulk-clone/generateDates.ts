import { HelperTask, HelperTaskCreationRequest } from "@/model/helpers-dtos";
import dayjs from "@/utils/dayjs";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LABELS: readonly { day: DayOfWeek; label: string }[] = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
];

/**
 * Generates all dates within the given range that fall on the specified days of the week.
 *
 * @param startDate start of the date range (inclusive)
 * @param endDate end of the date range (inclusive)
 * @param selectedDays days of the week to include (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @returns sorted array of matching dates
 */
export const generateDates = (
  startDate: dayjs.Dayjs,
  endDate: dayjs.Dayjs,
  selectedDays: ReadonlySet<DayOfWeek>,
): dayjs.Dayjs[] => {
  const dates: dayjs.Dayjs[] = [];
  let current = startDate.startOf("day");
  const end = endDate.startOf("day");

  while (current.isBefore(end) || current.isSame(end, "day")) {
    if (selectedDays.has(current.day() as DayOfWeek)) {
      dates.push(current);
    }
    current = current.add(1, "day");
  }

  return dates;
};

/**
 * Builds a creation request for a clone of the given task on the given date.
 * Preserves the time-of-day from the source task, only changing the date.
 * For multi-day shifts, the end date is offset by the same duration as the source.
 */
export const buildCloneRequest = (
  task: HelperTask,
  date: dayjs.Dayjs,
): HelperTaskCreationRequest => {
  const startsAt =
    task.startsAt &&
    date
      .hour(task.startsAt.hour())
      .minute(task.startsAt.minute())
      .second(task.startsAt.second());

  const endsAt =
    startsAt && task.startsAt && task.endsAt
      ? startsAt.add(task.endsAt.diff(task.startsAt), "millisecond")
      : null;

  const deadline =
    task.deadline &&
    date
      .hour(task.deadline.hour())
      .minute(task.deadline.minute())
      .second(task.deadline.second());

  return {
    categoryId: task.category.id,
    title: task.title,
    shortDescription: task.shortDescription,
    longDescription: task.longDescription,
    contactId: task.contact.id,
    startsAt: startsAt ?? null,
    endsAt: endsAt ?? null,
    deadline: deadline ?? null,
    urgent: task.urgent,
    captainRequiredLicenceInfoId: task.captainRequiredLicenceInfo?.id ?? null,
    helperMinCount: task.helperMinCount,
    helperMaxCount: task.helperMaxCount,
    published: task.published,
  };
};
