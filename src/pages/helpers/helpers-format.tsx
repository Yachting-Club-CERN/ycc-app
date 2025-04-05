import { HelperTask, HelperTaskType } from "@/model/helpers-dtos";
import {
  formatDateTime,
  formatDateWithDay,
  formatTime,
} from "@/utils/date-utils";

import { isMultiDayShift } from "./helpers-utils";

export const doneEmoji = "🚦";
export const validatedEmoji = "✔️";

/**
 * Gives a "fake random" sign up text. Deterministic.
 *
 * @returns a sign up text
 */
export const fakeRandomSignUpText = (taskId: number, captain: boolean) => {
  const texts = [
    // You want to keep the length of this array a prime number for best results
    "Sign me up!",
    "Sign me up!",
    "I am in!",
    "I will help!",
    "I will do it!",
  ];
  return texts[(taskId * (captain ? 2 : 1) * 92173) % texts.length];
};

/**
 * Returns the status emoji for a task.
 *
 * @param task a task
 * @returns the status emoji, or empty string if the task is pending
 */
export const getStatusEmoji = (task: HelperTask): string => {
  if (task.validatedAt) {
    return validatedEmoji;
  } else if (task.markedAsDoneAt) {
    return doneEmoji;
  } else {
    return "";
  }
};

/**
 * Creates the timing info line for a task.
 *
 * @param task a task
 * @returns the timing info line
 */
export const createTimingInfoLine = (task: HelperTask): string => {
  const labels = [task.urgent && "URGENT", !task.published && "HIDDEN"]
    .filter(Boolean)
    .join(", ");
  const statusEmoji = getStatusEmoji(task);
  const prefix = [
    labels && `(${labels}) `,
    statusEmoji && `${statusEmoji} `,
  ].join("");

  if (task.type === HelperTaskType.Shift) {
    if (isMultiDayShift(task)) {
      // That's an En Dash (U+2013)
      return `${prefix}Multi-Day Shift: ${formatDateTime(
        task.startsAt,
      )} – ${formatDateTime(task.endsAt)}`;
    } else {
      // That's an En Dash (U+2013)
      return `${prefix}Shift: ${formatDateWithDay(
        task.startsAt,
      )} ${formatTime(task.startsAt)} – ${formatTime(task.endsAt)}`;
    }
  } else if (task.type === HelperTaskType.Deadline) {
    return `${prefix}Deadline: ${formatDateWithDay(
      task.deadline,
    )} ${formatTime(task.deadline)}`;
  } else {
    return `${prefix}Start: ${
      formatDateTime(task.startsAt) ?? "-"
    } End: ${formatDateTime(task.endsAt) ?? "-"} Deadline: ${
      formatDateTime(task.deadline) ?? "-"
    }`;
  }
};
