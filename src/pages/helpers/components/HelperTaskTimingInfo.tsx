import SpanBlockBox from "@/components/layout/SpanBlockBox";
import { HelperTask, HelperTaskType } from "@/model/helpers-dtos";
import {
  formatDateTime,
  formatDateWithDay,
  formatTime,
} from "@/utils/date-utils";

import { getStatusEmoji } from "../helpers-format";
import { isMultiDayShift } from "../helpers-utils";

type Props = {
  task: HelperTask;
};

/**
 * Helper task timing info fragment.
 *
 * Uses `<span>` elements to allow usage in `<p>` elements as well.
 */
const HelperTaskTimingInfo: React.FC<Props> = ({ task }) => {
  const labels = [task.urgent && "Urgent", !task.published && "Hidden"]
    .filter(Boolean)
    .join(", ");
  const statusEmoji = getStatusEmoji(task);
  const suffix = [labels && ` (${labels})`, statusEmoji && ` ${statusEmoji}`]
    .filter(Boolean)
    .join("");

  // Visual note: Max 3 <SpanBlockBox> should be used on each branch
  if (task.type === HelperTaskType.Shift) {
    if (isMultiDayShift(task)) {
      return (
        <>
          <SpanBlockBox color="info.main" fontWeight="bold">
            Multi-Day Shift{suffix}
          </SpanBlockBox>
          <SpanBlockBox>Start: {formatDateTime(task.startsAt)}</SpanBlockBox>
          <SpanBlockBox>End: {formatDateTime(task.endsAt)}</SpanBlockBox>
        </>
      );
    } else {
      return (
        <>
          <SpanBlockBox color="info.main" fontWeight="bold">
            Shift{suffix}
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
        <SpanBlockBox color="warning.main" fontWeight="bold">
          Deadline{suffix}
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
          {suffix}
        </SpanBlockBox>
        <SpanBlockBox>End: {formatDateTime(task.endsAt) ?? "-"}</SpanBlockBox>
        <SpanBlockBox>
          Deadline: {formatDateTime(task.deadline) ?? "-"}
        </SpanBlockBox>
      </>
    );
  }
};

export default HelperTaskTimingInfo;
