import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import InlineFlexSpanBox from "@/components/layout/InlineFlexSpanBox";
import RowStack from "@/components/layout/RowStack";
import SpacedBox from "@/components/layout/SpacedBox";
import SpanBlockBox from "@/components/layout/SpanBlockBox";
import ErrorAlert from "@/components/ui/ErrorAlert";
import PageTitle from "@/components/ui/PageTitle";
import SpacedTypography from "@/components/ui/SpacedTypography";
import useConfirmationDialog from "@/hooks/dialogs/useConfirmationDialog";
import useMemberInfoDialog from "@/hooks/dialogs/useMemberInfoDialog";
import { MemberPublicInfo } from "@/model/dtos";
import { HelperTask, HelperTaskState } from "@/model/helpers-dtos";
import { formatDateTime } from "@/utils/date-utils";
import { sanitiseHtmlForReact } from "@/utils/html-utils";

import { getFullNameAndUsername } from "../members/members-utils";
import AddHelperActionButton from "./components/action-buttons/AddHelperActionButton";
import MarkAsDoneActionButton from "./components/action-buttons/MarkAsDoneActionButton";
import RemoveCaptainActionButton from "./components/action-buttons/RemoveCaptainActionButton";
import RemoveHelperActionButton from "./components/action-buttons/RemoveHelperActionButton";
import SetCaptainActionButton from "./components/action-buttons/SetCaptainActionButton";
import SignUpAsCaptainActionButton from "./components/action-buttons/SignUpAsCaptainActionButton";
import SignUpAsHelperActionButton from "./components/action-buttons/SignUpAsHelperActionButton";
import { TaskActionProps } from "./components/action-buttons/TaskActionButton";
import ValidateActionButton from "./components/action-buttons/ValidateActionButton";
import HelpersSpeedDial from "./components/HelpersSpeedDial";
import ShareTaskViaEmailIconButton from "./components/ShareTaskViaEmailIconButton";
import ShareTaskViaWhatsAppIconButton from "./components/ShareTaskViaWhatsAppIconButton";
import { createTimingInfoFragment } from "./helpers-format";

type Props = {
  task: HelperTask;
  refreshTask: (task: HelperTask) => void;
};

const HelperTaskInfo = ({ task, refreshTask }: Props) => {
  const [error, setError] = useState<unknown>();
  const memberInfoDialog = useMemberInfoDialog();
  const confirmationDialog = useConfirmationDialog();

  const createMemberDialogLink = (member: MemberPublicInfo) => (
    <Link onClick={() => memberInfoDialog.open({ member })}>
      {getFullNameAndUsername(member)}
    </Link>
  );

  const taskActionProps: TaskActionProps = {
    task,
    openConfirmationDialog: confirmationDialog.open,
    onTaskUpdate: refreshTask,
    onError: setError,
  };

  return (
    <>
      <PageTitle value={task.title} />
      <HelpersSpeedDial task={task} />

      <SpacedTypography variant="h3">
        Category: {task.category.title}
      </SpacedTypography>
      <SpacedTypography variant="body2">
        <Link component={RouterLink} to="/helpers">
          ← Back to the task list
        </Link>
      </SpacedTypography>
      <SpacedTypography>{createTimingInfoFragment(task)}</SpacedTypography>

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

      <SpacedTypography>
        <InlineFlexSpanBox>
          <SpanBlockBox mr={1}>Contact:</SpanBlockBox>
          {createMemberDialogLink(task.contact)}
        </InlineFlexSpanBox>
      </SpacedTypography>

      {task.captainRequiredLicenceInfo && (
        <SpacedTypography>
          <InlineFlexSpanBox>
            <SpanBlockBox mr={1}>Captain Required Licence:</SpanBlockBox>
            {task.captainRequiredLicenceInfo.licence}
          </InlineFlexSpanBox>
        </SpacedTypography>
      )}

      <SpacedTypography>
        <InlineFlexSpanBox>
          <SpanBlockBox mr={1}>
            Helpers needed (apart from captain):
          </SpanBlockBox>
          {task.helperMinCount === task.helperMaxCount
            ? task.helperMinCount
            : `${task.helperMinCount} - ${task.helperMaxCount}`}
        </InlineFlexSpanBox>
      </SpacedTypography>

      {task.captain && (
        <SpacedTypography>
          <InlineFlexSpanBox>
            <SpanBlockBox mr={1}>Captain:</SpanBlockBox>
            {createMemberDialogLink(task.captain.member)}
            <RemoveCaptainActionButton
              captain={task.captain.member}
              {...taskActionProps}
            />
          </InlineFlexSpanBox>
        </SpacedTypography>
      )}

      {task.helpers.length > 0 && (
        <SpacedTypography>
          <InlineFlexSpanBox>
            <SpanBlockBox mr={1}>Helpers:</SpanBlockBox>
            {task.helpers.map((helper) => (
              <InlineFlexSpanBox key={helper.member.id} mr={1}>
                {createMemberDialogLink(helper.member)}
                <RemoveHelperActionButton
                  helper={helper.member}
                  {...taskActionProps}
                />
              </InlineFlexSpanBox>
            ))}
          </InlineFlexSpanBox>
        </SpacedTypography>
      )}

      {task.state !== HelperTaskState.Pending && (
        <>
          <Divider sx={{ mt: 2 }} />
          <SpacedTypography variant="h6" color="success">
            Update @ {formatDateTime(task.markedAsDoneAt)}:{" "}
            {createMemberDialogLink(task.markedAsDoneBy!)} marked the task as
            done
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
            {createMemberDialogLink(task.validatedBy!)} validated the task
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
          to withdraw from a shift, please first find a replacement (e.g., in
          the port or in one of the WhatsApp groups), then notify the contact by
          email (and CC your replacement). The contact will administer the
          change.
        </Typography>
      </Alert>

      {memberInfoDialog.component}
      {confirmationDialog.component}
    </>
  );
};

export default HelperTaskInfo;
