import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import useConfirmationDialog from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import useMemberInfoDialog from "@/components/dialogs/MemberInfoDialog/useMemberInfoDialog";
import RowStack from "@/components/layout/RowStack";
import SpacedBox from "@/components/layout/SpacedBox";
import ErrorAlert from "@/components/ui/ErrorAlert";
import PageTitle from "@/components/ui/PageTitle";
import SpacedTypography from "@/components/ui/SpacedTypography";
import { MemberPublicInfo } from "@/model/dtos";
import { HelperTask, HelperTaskState } from "@/model/helpers-dtos";
import AddHelperActionButton from "@/pages/helpers/components/action-buttons/AddHelperActionButton";
import MarkAsDoneActionButton from "@/pages/helpers/components/action-buttons/MarkAsDoneActionButton";
import RemoveCaptainActionButton from "@/pages/helpers/components/action-buttons/RemoveCaptainActionButton";
import RemoveHelperActionButton from "@/pages/helpers/components/action-buttons/RemoveHelperActionButton";
import SetCaptainActionButton from "@/pages/helpers/components/action-buttons/SetCaptainActionButton";
import SignUpAsCaptainActionButton from "@/pages/helpers/components/action-buttons/SignUpAsCaptainActionButton";
import SignUpAsHelperActionButton from "@/pages/helpers/components/action-buttons/SignUpAsHelperActionButton";
import { TaskActionProps } from "@/pages/helpers/components/action-buttons/TaskActionButton";
import ValidateActionButton from "@/pages/helpers/components/action-buttons/ValidateActionButton";
import AttachmentsSection from "@/pages/helpers/components/attachments/AttachmentsSection";
import HelperTaskDetailActions from "@/pages/helpers/components/HelperTaskDetailActions";
import HelperTaskTimingInfo from "@/pages/helpers/components/HelperTaskTimingInfo";
import ShareTaskViaEmailIconButton from "@/pages/helpers/components/ShareTaskViaEmailIconButton";
import ShareTaskViaWhatsAppIconButton from "@/pages/helpers/components/ShareTaskViaWhatsAppIconButton";
import { getFullNameAndUsername } from "@/pages/members/members-utils";
import { ATTACHMENTS_CATEGORY_MATCH } from "@/utils/constants";
import { formatDateTime } from "@/utils/date-utils";
import { sanitiseHtmlForReact } from "@/utils/html-utils";

type Props = {
  task: HelperTask;
  refreshTask: (task: HelperTask) => void;
};

const HelperTaskView = ({ task, refreshTask }: Props): React.ReactNode => {
  const [error, setError] = useState<unknown>();
  const memberInfoDialog = useMemberInfoDialog();
  const confirmationDialog = useConfirmationDialog();

  const createMemberDialogLink = (
    member: MemberPublicInfo,
  ): React.ReactNode => (
    <Link
      onClick={() => {
        memberInfoDialog.open({ member });
      }}
    >
      {getFullNameAndUsername(member)}
    </Link>
  );

  const taskActionProps: TaskActionProps = {
    task,
    openConfirmationDialog: confirmationDialog.open,
    onTaskUpdate: refreshTask,
    onError: setError,
  };

  const showAttachmentsSection = task.category.title
    .toLowerCase()
    .includes(ATTACHMENTS_CATEGORY_MATCH);

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        rowGap={0.5}
        mb={2}
      >
        <PageTitle value={task.title} mb={0} />
        <Box sx={{ marginLeft: "auto" }}>
          <HelperTaskDetailActions task={task} />
        </Box>
      </Stack>

      <SpacedTypography variant="h3">
        Category: {task.category.title}
      </SpacedTypography>
      <SpacedTypography>
        <HelperTaskTimingInfo task={task} />
      </SpacedTypography>
      <Divider sx={{ mt: 2 }} />

      <SpacedTypography>{task.shortDescription}</SpacedTypography>
      <Divider sx={{ mt: 2 }} />

      {task.longDescription && (
        <>
          <SpacedTypography component="div">
            {sanitiseHtmlForReact(task.longDescription)}
          </SpacedTypography>
          <Divider sx={{ mt: 2 }} />
        </>
      )}

      {showAttachmentsSection && (
        <>
          <AttachmentsSection task={task} />
          <Divider sx={{ mt: 2 }} />
        </>
      )}

      <RowStack wrap={true} compact={true} mt={2} mb={2}>
        <Box width={60}>Contact:</Box>
        <Box>{createMemberDialogLink(task.contact)}</Box>
      </RowStack>

      {task.captainRequiredLicenceInfo && (
        <SpacedTypography>
          Captain Required Licence: {task.captainRequiredLicenceInfo.licence}
        </SpacedTypography>
      )}

      <SpacedTypography>
        Helpers needed (apart from captain):{" "}
        {task.helperMinCount === task.helperMaxCount
          ? task.helperMinCount
          : `${task.helperMinCount} - ${task.helperMaxCount}`}
      </SpacedTypography>

      {task.captain && (
        <RowStack wrap={true} compact={true} mb={2}>
          <Box width={60}>Captain:</Box>
          <RowStack wrap={false} compact={true}>
            {createMemberDialogLink(task.captain.member)}
            <RemoveCaptainActionButton
              captain={task.captain.member}
              {...taskActionProps}
            />
          </RowStack>
        </RowStack>
      )}

      {task.helpers.length > 0 && (
        <RowStack wrap={true} compact={true} alignItems="flex-start" mb={2}>
          <Box width={60}>Helpers:</Box>
          <Stack direction="column">
            {task.helpers.map((helper) => (
              <RowStack key={helper.member.id} wrap={false} compact={true}>
                {createMemberDialogLink(helper.member)}
                <RemoveHelperActionButton
                  helper={helper.member}
                  {...taskActionProps}
                />
              </RowStack>
            ))}
          </Stack>
        </RowStack>
      )}

      {task.state !== HelperTaskState.Pending && (
        <>
          <Divider sx={{ mt: 2 }} />
          <SpacedTypography variant="h6" color="success">
            Update @ {formatDateTime(task.markedAsDoneAt)}:{" "}
            {task.markedAsDoneBy && createMemberDialogLink(task.markedAsDoneBy)}{" "}
            marked the task as done
          </SpacedTypography>
          {task.markedAsDoneComment && (
            <SpacedTypography component="div" ml={4}>
              {sanitiseHtmlForReact(task.markedAsDoneComment)}
            </SpacedTypography>
          )}
        </>
      )}

      {task.state === HelperTaskState.Validated && (
        <>
          <Divider sx={{ mt: 2 }} />
          <SpacedTypography variant="h6" color="success">
            Update @ {formatDateTime(task.validatedAt)}:{" "}
            {task.validatedBy && createMemberDialogLink(task.validatedBy)}{" "}
            validated the task
          </SpacedTypography>
          {task.validationComment && (
            <SpacedTypography component="div" ml={4}>
              {sanitiseHtmlForReact(task.validationComment)}
            </SpacedTypography>
          )}
        </>
      )}

      <RowStack wrap={true}>
        <SignUpAsCaptainActionButton {...taskActionProps} />
        <SignUpAsHelperActionButton {...taskActionProps} />

        <RowStack wrap={false}>
          <SetCaptainActionButton {...taskActionProps} />
          <AddHelperActionButton {...taskActionProps} />
        </RowStack>

        <RowStack wrap={false}>
          <MarkAsDoneActionButton {...taskActionProps} />
          <ValidateActionButton {...taskActionProps} />
        </RowStack>

        <RowStack wrap={false}>
          <ShareTaskViaEmailIconButton task={task} />
          <ShareTaskViaWhatsAppIconButton task={task} />
        </RowStack>
      </RowStack>

      {error && (
        <SpacedBox>
          <ErrorAlert error={error} />
        </SpacedBox>
      )}

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography>
          After signing up for a task you will be unable to cancel. If you need
          to withdraw from a task, please find a replacement first (e.g., in one
          of the WhatsApp groups), then notify the contact by email (and CC your
          replacement). The contact will administer the change.
        </Typography>
      </Alert>

      {memberInfoDialog.component}
      {confirmationDialog.component}
    </>
  );
};

export default HelperTaskView;
