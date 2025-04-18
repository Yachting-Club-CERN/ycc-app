import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

import useCurrentUser from "@/context/auth/useCurrentUser";
import { MemberPublicInfo } from "@/model/dtos";
import { getFullNameAndUsername } from "@/pages/members/members-utils";
import client from "@/utils/client";

import NotificationDialogNotice from "./NotificationDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import { canAddOrRemoveMembers } from "../../helpers-utils";

type Props = {
  helper: MemberPublicInfo;
} & TaskActionProps;

const RemoveHelperActionButton: React.FC<Props> = ({
  helper,
  task,
  ...props
}) => {
  const currentUser = useCurrentUser();

  if (!canAddOrRemoveMembers(task, currentUser)) {
    return null;
  }

  return (
    <TaskActionButton
      buttonIcon={<PersonRemoveIcon fontSize="small" />}
      buttonColor="error"
      buttonSx={{ p: 0 }}
      dialogTitle={`Remove ${getFullNameAndUsername(helper)}?`}
      dialogContent={<NotificationDialogNotice />}
      dialogConfirmButtonColor="error"
      dialogConfirmButtonText="Remove Helper"
      dialogCancelButtonColor="primary"
      dialogDelayConfirm={true}
      onDialogConfirm={async () =>
        await client.helpers.removeHelper(task.id, helper.id)
      }
      {...props}
    />
  );
};

export default RemoveHelperActionButton;
