import { useCallback, useState } from "react";

import { useNavigate } from "@/hooks/useNavigate";
import { HelperTask } from "@/model/helpers-dtos";
import client from "@/utils/client";

import BulkCloneDialog from "./BulkCloneDialog";

const useBulkCloneDialog = (): {
  component: React.ReactNode;
  open: (task: HelperTask) => void;
} => {
  const [task, setTask] = useState<HelperTask | null>(null);
  const navigate = useNavigate();

  const close = useCallback(() => {
    setTask(null);
  }, []);

  const handleComplete = useCallback(async () => {
    setTask(null);
    await navigate("/helpers");
  }, [navigate]);

  return {
    component: task && (
      <BulkCloneDialog
        task={task}
        open
        onClose={close}
        onCreateTask={(request) => client.helpers.createTask(request)}
        onComplete={handleComplete}
      />
    ),
    open: setTask,
  };
};

export default useBulkCloneDialog;
