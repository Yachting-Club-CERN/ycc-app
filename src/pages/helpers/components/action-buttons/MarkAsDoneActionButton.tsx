import DialogContentText from "@mui/material/DialogContentText";

import useRichTextEditor from "@/components/ui/RichTextEditor/useRichTextEditor";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { canMarkAsDone } from "@/pages/helpers/helpers-utils";
import client from "@/utils/client";

import TaskActionButton, { TaskActionProps } from "./TaskActionButton";

const MarkAsDoneActionButton = ({
  task,
  ...props
}: TaskActionProps): React.ReactNode => {
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
      buttonText="Mark as Done"
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
