import DialogContentText from "@mui/material/DialogContentText";

import useCurrentUser from "@/hooks/auth/useCurrentUser";
import useRichTextEditor from "@/hooks/ui/useRichTextEditor";
import client from "@/utils/client";

import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import { canMarkAsDone } from "../../helpers-utils";

const MarkAsDoneActionButton = ({ task, ...props }: TaskActionProps) => {
  const currentUser = useCurrentUser();

  if (!canMarkAsDone(task, currentUser)) {
    return null;
  }

  const commentEditor = useRichTextEditor({
    minHeight: 100,
    containerProps: { mb: 2 },
  });

  return (
    <TaskActionButton
      buttonText="Mark As Done"
      buttonColor="warning"
      dialogTitle="Are you sure you want to mark the task as done?"
      dialogContent={
        <>
          <DialogContentText mb={2}>
            This will notify the contact that{" "}
            <strong>the task is completed</strong> to and it can be validated.
          </DialogContentText>
          <DialogContentText mb={2}>
            Comment (optional, e.g., no shows):
          </DialogContentText>
          {commentEditor.component}
        </>
      }
      onDialogOpening={() => commentEditor.clearContent()}
      onDialogConfirm={async () =>
        await client.helpers.markAsDone(task.id, {
          comment: commentEditor.content,
        })
      }
      {...props}
    />
  );
};

export default MarkAsDoneActionButton;
