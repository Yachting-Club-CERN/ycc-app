import useMemberAutocomplete from "@/components/ui/MemberAutocomplete/useMemberAutocomplete";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { canSetCaptain } from "@/pages/helpers/helpers-utils";
import client from "@/utils/client";

import NotificationDialogNotice from "./NotificationDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";

const SetCaptainActionButton = ({
  task,
  ...props
}: TaskActionProps): React.ReactNode => {
  const currentUser = useCurrentUser();
  const memberAutoComplete = useMemberAutocomplete({ mt: 1, mb: 2 });

  if (!canSetCaptain(task, currentUser)) {
    return null;
  }

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
