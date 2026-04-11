import { useCallback, useState } from "react";

import { HelperTask, HelperTaskUpdateRequest } from "@/model/helpers-dtos";
import client from "@/utils/client";

export type MassPublishState =
  | { status: "idle" }
  | { status: "updating"; completed: number; total: number }
  | { status: "done"; updated: number; skipped: number; failed: number };

const buildUpdateRequest = (
  task: HelperTask,
  published: boolean,
): HelperTaskUpdateRequest => ({
  categoryId: task.category.id,
  title: task.title,
  shortDescription: task.shortDescription,
  longDescription: task.longDescription,
  contactId: task.contact.id,
  startsAt: task.startsAt,
  endsAt: task.endsAt,
  deadline: task.deadline,
  urgent: task.urgent,
  captainRequiredLicenceInfoId: task.captainRequiredLicenceInfo?.id ?? null,
  helperMinCount: task.helperMinCount,
  helperMaxCount: task.helperMaxCount,
  published,
  notifySignedUpMembers: false,
});

const useMassPublish = (): {
  state: MassPublishState;
  start: (tasks: readonly HelperTask[], published: boolean) => Promise<void>;
  reset: () => void;
} => {
  const [state, setState] = useState<MassPublishState>({ status: "idle" });

  const start = useCallback(
    async (tasks: readonly HelperTask[], published: boolean) => {
      const toUpdate = tasks.filter((t) => t.published !== published);
      const skipped = tasks.length - toUpdate.length;
      let updated = 0;
      let failed = 0;

      setState({
        status: "updating",
        completed: 0,
        total: toUpdate.length,
      });

      for (const task of toUpdate) {
        try {
          await client.helpers.updateTask(
            task.id,
            buildUpdateRequest(task, published),
          );
          updated++;
        } catch {
          failed++;
        }
        setState({
          status: "updating",
          completed: updated + failed,
          total: toUpdate.length,
        });
      }

      setState({ status: "done", updated, skipped, failed });
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, start, reset };
};

export default useMassPublish;
