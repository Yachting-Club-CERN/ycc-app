import DialogContentText from "@mui/material/DialogContentText";

import useRichTextEditor from "@/components/ui/RichTextEditor/useRichTextEditor";
import useCurrentUser from "@/context/auth/useCurrentUser";
import client from "@/utils/client";

import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import { canValidate } from "../../helpers-utils";

const ValidateActionButton: React.FC<TaskActionProps> = ({
  task,
  ...props
}) => {
  const currentUser = useCurrentUser();

  if (!canValidate(task, currentUser)) {
    return null;
  }

  const commentEditor = useRichTextEditor({
    minHeight: 100,
    containerProps: { mb: 2 },
  });

  return (
    <TaskActionButton
      buttonText="Validate"
      buttonColor="success"
      dialogTitle="Task validation"
      dialogContent={
        <>
          <DialogContentText mb={2}>
            If you need to remove a member from the task (e.g., no show), please
            close this dialog and use the icon next to the member&apos;s name.
          </DialogContentText>
          <DialogContentText mb={2}>Comment (optional):</DialogContentText>
          {commentEditor.component}
        </>
      }
      onDialogOpening={() => commentEditor.clearContent()}
      onDialogConfirm={async () =>
        await client.helpers.validate(task.id, {
          comment: commentEditor.content,
        })
      }
      {...props}
    />
  );
};

export default ValidateActionButton;
