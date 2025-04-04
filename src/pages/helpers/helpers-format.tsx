import { JSX } from "react";

import SpanBlockBox from "@/components/layout/SpanBlockBox";
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
  let extraTimingTitle = [
    task.urgent ? "URGENT" : "",
    task.published ? "" : "HIDDEN",
  ]
    .filter(Boolean)
    .join(", ");
  if (extraTimingTitle !== "") {
    extraTimingTitle = `${extraTimingTitle} `;
  }

  let statusEmoji = getStatusEmoji(task);
  if (statusEmoji) {
    statusEmoji = `${statusEmoji} `;
  }

  if (task.type === HelperTaskType.Shift) {
    if (isMultiDayShift(task)) {
      // That's an En Dash (U+2013)
      return `${extraTimingTitle}${statusEmoji}Multi-Day Shift: ${formatDateTime(
        task.startsAt,
      )} – ${formatDateTime(task.endsAt)}`;
    } else {
      // That's an En Dash (U+2013)
      return `${extraTimingTitle}${statusEmoji}Shift: ${formatDateWithDay(
        task.startsAt,
      )} ${formatTime(task.startsAt)} – ${formatTime(task.endsAt)}`;
    }
  } else if (task.type === HelperTaskType.Deadline) {
    return `${extraTimingTitle}${statusEmoji}Deadline: ${formatDateWithDay(
      task.deadline,
    )} ${formatTime(task.deadline)}`;
  } else {
    return `${extraTimingTitle}${statusEmoji}Start: ${
      formatDateTime(task.startsAt) ?? "-"
    } End: ${formatDateTime(task.endsAt) ?? "-"} Deadline: ${
      formatDateTime(task.deadline) ?? "-"
    }`;
  }
};

/**
 * Creates the timing info fragment for a task.
 *
 * @param task a task
 * @returns the timing info fragment
 */
export const createTimingInfoFragment = (task: HelperTask): JSX.Element => {
  let extraTimingTitle = [
    task.urgent ? "Urgent" : "",
    task.published ? "" : "Hidden",
  ]
    .filter(Boolean)
    .join(", ");
  if (extraTimingTitle !== "") {
    extraTimingTitle = ` (${extraTimingTitle})`;
  }

  let statusEmoji = getStatusEmoji(task);
  if (statusEmoji) {
    statusEmoji = ` ${statusEmoji}`;
  }

  // Visual note: Max 3 <SpanBlockBox> should be used on each branch
  if (task.type === HelperTaskType.Shift) {
    if (isMultiDayShift(task)) {
      return (
        <>
          <SpanBlockBox sx={{ color: "info.main", fontWeight: "bold" }}>
            Multi-Day Shift{extraTimingTitle}
            {statusEmoji}
          </SpanBlockBox>
          <SpanBlockBox>Start: {formatDateTime(task.startsAt)}</SpanBlockBox>
          <SpanBlockBox>End: {formatDateTime(task.endsAt)}</SpanBlockBox>
        </>
      );
    } else {
      return (
        <>
          <SpanBlockBox sx={{ color: "info.main", fontWeight: "bold" }}>
            Shift{extraTimingTitle}
            {statusEmoji}
          </SpanBlockBox>
          <SpanBlockBox>{formatDateWithDay(task.startsAt)}</SpanBlockBox>
          <SpanBlockBox>
            {/* That's an En Dash (U+2013) */}
            {formatTime(task.startsAt)} – {formatTime(task.endsAt)}
          </SpanBlockBox>
        </>
      );
    }
  } else if (task.type === HelperTaskType.Deadline) {
    return (
      <>
        <SpanBlockBox sx={{ color: "warning.main", fontWeight: "bold" }}>
          Deadline{extraTimingTitle}
          {statusEmoji}
        </SpanBlockBox>
        <SpanBlockBox>{formatDateWithDay(task.deadline)}</SpanBlockBox>
        <SpanBlockBox>{formatTime(task.deadline)}</SpanBlockBox>
      </>
    );
  } else {
    // Fallback for inconsistent data
    return (
      <>
        <SpanBlockBox>
          Start: {formatDateTime(task.startsAt) ?? "-"}
          {statusEmoji}
        </SpanBlockBox>
        <SpanBlockBox>End: {formatDateTime(task.endsAt) ?? "-"}</SpanBlockBox>
        <SpanBlockBox>
          Deadline: {formatDateTime(task.deadline) ?? "-"}
        </SpanBlockBox>
      </>
    );
  }
};
