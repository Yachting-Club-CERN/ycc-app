import useMemberAutocomplete from "@/components/ui/MemberAutocomplete/useMemberAutocomplete";
import useCurrentUser from "@/context/auth/useCurrentUser";
import client from "@/utils/client";

import NotificationDialogNotice from "./NotificationDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import { canAddHelper } from "../../helpers-utils";

const AddHelperActionButton: React.FC<TaskActionProps> = ({
  task,
  ...props
}) => {
  const currentUser = useCurrentUser();
  const memberAutoComplete = useMemberAutocomplete({ mt: 1, mb: 2 });

  if (!canAddHelper(task, currentUser)) {
    return null;
  }

  return (
    <TaskActionButton
      buttonText="Add Helper"
      buttonColor="secondary"
      dialogTitle="Add helper to the task"
      dialogContent={
        <>
          {memberAutoComplete.component}
          <NotificationDialogNotice />
        </>
      }
      onDialogOpening={() => memberAutoComplete.clearSelection()}
      onDialogConfirm={async () =>
        await client.helpers.addHelper(
          task.id,
          memberAutoComplete.requireSelectedMember.id,
        )
      }
      {...props}
    />
  );
};

export default AddHelperActionButton;
