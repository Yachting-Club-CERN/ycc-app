import useCurrentUser from "@/context/auth/useCurrentUser";
import client from "@/utils/client";

import CannotCancelDialogNotice from "./CannotCancelDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import { canSignUpAsHelper } from "../../helpers-utils";

const SignUpAsHelperActionButton: React.FC<TaskActionProps> = ({
  task,
  ...props
}) => {
  const currentUser = useCurrentUser();

  if (!canSignUpAsHelper(task, currentUser)) {
    return null;
  }

  return (
    <TaskActionButton
      buttonText="Sign up as Helper"
      buttonColor="primary"
      dialogTitle="Are you sure you want to sign up as helper?"
      dialogContent={<CannotCancelDialogNotice />}
      onDialogConfirm={async () => await client.helpers.signUpAsHelper(task.id)}
      {...props}
    />
  );
};

export default SignUpAsHelperActionButton;
