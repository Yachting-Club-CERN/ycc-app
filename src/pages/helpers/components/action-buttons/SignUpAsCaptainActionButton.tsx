import DialogContentText from "@mui/material/DialogContentText";

import useCurrentUser from "@/context/auth/useCurrentUser";
import client from "@/utils/client";

import CannotCancelDialogNotice from "./CannotCancelDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import { canSignUpAsCaptain } from "../../helpers-utils";

const SignUpAsCaptainActionButton: React.FC<TaskActionProps> = ({
  task,
  ...props
}) => {
  const currentUser = useCurrentUser();

  if (!canSignUpAsCaptain(task, currentUser)) {
    return null;
  }

  return (
    <TaskActionButton
      buttonText="Sign up as Captain"
      buttonColor="primary"
      dialogTitle="Are you sure you want to sign up as captain?"
      dialogContent={
        <>
          <DialogContentText mb={2}>
            As a captain <strong>you will take lead</strong> and make sure that
            the task is carried out, e.g., driving the Q-Boat, organising other
            helpers who signed up for the task, etc.
          </DialogContentText>
          <CannotCancelDialogNotice />
        </>
      }
      onDialogConfirm={async () =>
        await client.helpers.signUpAsCaptain(task.id)
      }
      {...props}
    />
  );
};

export default SignUpAsCaptainActionButton;
