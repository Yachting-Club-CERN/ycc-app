import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

import useCurrentUser from "@/hooks/auth/useCurrentUser";
import { MemberPublicInfo } from "@/model/dtos";
import { getFullNameAndUsername } from "@/pages/members/members-utils";
import client from "@/utils/client";

import NotificationDialogNotice from "./NotificationDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import { canAddOrRemoveMembers } from "../../helpers-utils";

type Props = {
  helper: MemberPublicInfo;
} & TaskActionProps;

const RemoveHelperActionButton = ({ helper, task, ...props }: Props) => {
  const currentUser = useCurrentUser();

  if (!canAddOrRemoveMembers(task, currentUser)) {
    return null;
  }

  return (
    <TaskActionButton
      buttonIcon={<PersonRemoveIcon fontSize="small" />}
      buttonColor="error"
      buttonSx={{ pl: 1, pt: 0, pr: 1, pb: 0 }}
      dialogTitle={`Remove ${getFullNameAndUsername(helper)}?`}
      dialogContent={<NotificationDialogNotice />}
      dialogDelayConfirm={true}
      onDialogConfirm={async () =>
        await client.helpers.removeHelper(task.id, helper.id)
      }
      {...props}
    />
  );
};

export default RemoveHelperActionButton;
