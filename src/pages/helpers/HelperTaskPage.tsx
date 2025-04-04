import { useState } from "react";
import { useParams } from "react-router-dom";

import ReadingFriendlyBox from "@/components/layout/ReadingFriendlyBox";
import PromiseStatus from "@/components/ui/PromiseStatus";
import usePromise from "@/hooks/usePromise";
import { HelperTask } from "@/model/helpers-dtos";
import client from "@/utils/client";

import HelperTaskInfo from "./HelperTaskInfo";

const HelperTaskPage = () => {
  const { id } = useParams();
  const getHelperTask = (signal?: AbortSignal) => {
    const task_id = parseInt(id ?? "NaN");
    if (isNaN(task_id)) {
      throw new Error("Invalid task ID");
    } else {
      return client.helpers.getTaskById(task_id, signal);
    }
  };
  const task = usePromise(getHelperTask, [id]);
  const [updatedTask, setUpdatedTask] = useState<HelperTask>();
  const taskToDisplay = updatedTask ?? task.result;

  return (
    <ReadingFriendlyBox>
      {taskToDisplay && (
        <HelperTaskInfo task={taskToDisplay} refreshTask={setUpdatedTask} />
      )}
      {!taskToDisplay && <PromiseStatus outcomes={[task]} />}
    </ReadingFriendlyBox>
  );
};

export default HelperTaskPage;
