import useCurrentUser from "@/context/auth/useCurrentUser";
import { canSignUpAsHelper } from "@/pages/helpers/helpers-utils";
import client from "@/utils/client";

import CannotCancelDialogNotice from "./CannotCancelDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";

const SignUpAsHelperActionButton = ({
  task,
  ...props
}: TaskActionProps): React.ReactNode => {
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
