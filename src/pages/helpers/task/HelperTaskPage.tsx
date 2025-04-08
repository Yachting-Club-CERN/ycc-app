import { useState } from "react";
import { useParams } from "react-router-dom";

import ReadingBox from "@/components/layout/ReadingBox";
import PromiseStatus from "@/components/ui/PromiseStatus";
import usePromise from "@/hooks/usePromise";
import { HelperTask } from "@/model/helpers-dtos";
import client from "@/utils/client";

import HelperTaskView from "./HelperTaskView";

const HelperTaskPage: React.FC = () => {
  const { id } = useParams();
  const task = usePromise(
    async (signal?: AbortSignal) => {
      const task_id = parseInt(id ?? "NaN");
      if (isNaN(task_id)) {
        throw new Error("Invalid task ID");
      } else {
        return await client.helpers.getTaskById(task_id, signal);
      }
    },
    [id],
  );
  const [updatedTask, setUpdatedTask] = useState<HelperTask>();
  const taskToDisplay = updatedTask ?? task.result;

  return (
    <ReadingBox>
      {taskToDisplay && (
        <HelperTaskView task={taskToDisplay} refreshTask={setUpdatedTask} />
      )}
      {!taskToDisplay && <PromiseStatus outcomes={[task]} />}
    </ReadingBox>
  );
};

export default HelperTaskPage;
