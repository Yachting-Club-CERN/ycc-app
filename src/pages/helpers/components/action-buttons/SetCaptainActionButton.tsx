import useCurrentUser from "@/hooks/auth/useCurrentUser";
import client from "@/utils/client";

import NotificationDialogNotice from "./NotificationDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import useMemberAutocomplete from "../../../../hooks/ui/useMemberAutocomplete";
import { canSetCaptain } from "../../helpers-utils";

const SetCaptainActionButton = ({ task, ...props }: TaskActionProps) => {
  const currentUser = useCurrentUser();

  if (!canSetCaptain(task, currentUser)) {
    return null;
  }

  const memberAutoComplete = useMemberAutocomplete({ mt: 1, mb: 2 });

  return (
    <TaskActionButton
      buttonText="Set Captain"
      buttonColor="secondary"
      dialogTitle="Set the captain for the task"
      dialogContent={
        <>
          {memberAutoComplete.component}
          <NotificationDialogNotice />
        </>
      }
      onDialogOpening={() => memberAutoComplete.clearSelection()}
      onDialogConfirm={async () =>
        await client.helpers.setCaptain(
          task.id,
          memberAutoComplete.requireSelectedMember.id,
        )
      }
      {...props}
    />
  );
};

export default SetCaptainActionButton;
