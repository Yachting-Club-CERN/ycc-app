import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

import useCurrentUser from "@/context/auth/useCurrentUser";
import { MemberPublicInfo } from "@/model/dtos";
import { getFullNameAndUsername } from "@/pages/members/members-utils";
import client from "@/utils/client";

import NotificationDialogNotice from "./NotificationDialogNotice";
import TaskActionButton, { TaskActionProps } from "./TaskActionButton";
import { canAddOrRemoveMembers } from "../../helpers-utils";

type Props = {
  captain: MemberPublicInfo;
} & TaskActionProps;

const RemoveCaptainActionButton = ({ captain, task, ...props }: Props) => {
  const currentUser = useCurrentUser();

  if (!canAddOrRemoveMembers(task, currentUser)) {
    return null;
  }

  return (
    <TaskActionButton
      buttonIcon={<PersonRemoveIcon fontSize="small" />}
      buttonColor="error"
      buttonSx={{ p: 0 }}
      dialogTitle={`Remove ${getFullNameAndUsername(captain)}?`}
      dialogContent={<NotificationDialogNotice />}
      dialogDelayConfirm={true}
      onDialogConfirm={async () => await client.helpers.removeCaptain(task.id)}
      {...props}
    />
  );
};

export default RemoveCaptainActionButton;
