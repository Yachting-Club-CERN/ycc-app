import { useCallback, useState } from "react";

import { HelperTask, HelperTaskCreationRequest } from "@/model/helpers-dtos";
import dayjs from "@/utils/dayjs";

import { buildCloneRequest } from "./generateDates";

export type BulkCreateState =
  | { status: "idle" }
  | { status: "creating"; completed: number; total: number }
  | { status: "done"; created: number; failed: number };

const useBulkCreate = (
  task: HelperTask,
  onCreateTask: (request: HelperTaskCreationRequest) => Promise<HelperTask>,
): {
  state: BulkCreateState;
  start: (dates: dayjs.Dayjs[]) => Promise<void>;
} => {
  const [state, setState] = useState<BulkCreateState>({ status: "idle" });

  const start = useCallback(
    async (dates: dayjs.Dayjs[]) => {
      let created = 0;
      let failed = 0;

      setState({ status: "creating", completed: 0, total: dates.length });

      for (const date of dates) {
        try {
          await onCreateTask(buildCloneRequest(task, date));
          created++;
        } catch {
          failed++;
        }
        setState({
          status: "creating",
          completed: created + failed,
          total: dates.length,
        });
      }

      setState({ status: "done", created, failed });
    },
    [task, onCreateTask],
  );

  return { state, start };
};

export default useBulkCreate;
