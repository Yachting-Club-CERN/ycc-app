import useCurrentUser from "@/hooks/auth/useCurrentUser";
import client from "@/utils/client";

import NotificationDialogNotice from "./NotificationDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import useMemberAutocomplete from "../../../../hooks/ui/useMemberAutocomplete";
import { canAddHelper } from "../../helpers-utils";

const AddHelperActionButton = ({ task, ...props }: TaskActionProps) => {
  const currentUser = useCurrentUser();

  if (!canAddHelper(task, currentUser)) {
    return null;
  }

  const memberAutoComplete = useMemberAutocomplete({ mt: 1, mb: 2 });

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
