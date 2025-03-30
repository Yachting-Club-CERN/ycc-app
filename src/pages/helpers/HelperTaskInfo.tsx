import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import React, { useContext, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import ErrorAlert from "@/components/ErrorAlert";
import RichTextEditor from "@/components/RichTextEditor";
import SpacedBox from "@/components/SpacedBox";
import SpacedTypography from "@/components/SpacedTypography";
import AuthenticationContext from "@/context/AuthenticationContext";
import useConfirmationDialog from "@/hooks/useConfirmationDialog";
import useDelayedRef from "@/hooks/useDelayedRef";
import useMemberInfoDialog from "@/hooks/useMemberInfoDialog";
import { MemberPublicInfo } from "@/model/dtos";
import {
  HelperTask,
  HelperTaskHelper,
  HelperTaskState,
} from "@/model/helpers-dtos";
import client from "@/utils/client";
import { formatDateTime } from "@/utils/date-utils";
import { sanitiseHtmlForReact } from "@/utils/html-utils";

import {
  canMarkTaskAsDone,
  canSignUpAsCaptain,
  canSignUpAsHelper,
  canValidate,
  createTimingInfoFragment,
} from "./helpers-utils";
import PageTitleWithTaskActions from "./PageTitleWithTaskActions";

type Props = {
  task: HelperTask;
  refreshTask: (task: HelperTask) => void;
};

const HelperTaskInfo = ({ task, refreshTask }: Props) => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const [error, setError] = useState<unknown>();
  const { memberInfoDialogComponent, openMemberInfoDialog } =
    useMemberInfoDialog();
  const { confirmationDialogComponent, openConfirmationDialog } =
    useConfirmationDialog();

  const confirmationDialogComment = useDelayedRef("");

  const validation = {
    helpersToValidate: useRef<HelperTaskHelper[]>([]),
    helpersToRemove: useRef<HelperTaskHelper[]>([]),
  };

  const createMemberDialogLink = (member: MemberPublicInfo) => {
    return (
      <Link onClick={() => openMemberInfoDialog(member)}>
        {member.username}
      </Link>
    );
  };

  const confirmationDialogCommentComponent = (
    <RichTextEditor
      minHeight={100}
      onBlur={confirmationDialogComment.setImmediately}
      onCreate={confirmationDialogComment.setImmediately}
      onUpdate={confirmationDialogComment.setWithDelay}
    />
  );
  const helperValidationComponent = (
    <>
      <DialogContentText>
        Please unmark any helpers who did not show up. If a helper was available
        but missed the task due to a change on your part (e.g., you changed the
        time after they signed up), they should still be marked as present.
      </DialogContentText>
      {task.helpers.map((helper) => (
        <FormControlLabel
          key={helper.member.id}
          control={
            <Switch
              defaultChecked={true}
              onChange={(e) => {
                const [add, remove] = e.target.checked
                  ? [validation.helpersToValidate, validation.helpersToRemove]
                  : [validation.helpersToRemove, validation.helpersToValidate];

                add.current.push(helper);

                remove.current = remove.current.filter(
                  (h) => h.member.id !== helper.member.id,
                );
              }}
            />
          }
          label={`${helper.member.firstName} ${helper.member.lastName}`}
        />
      ))}
    </>
  );

  const showSignUpAsCaptain = canSignUpAsCaptain(task, currentUser);
  const showSignUpAsHelper = canSignUpAsHelper(task, currentUser);
  const showMarkAsDone = canMarkTaskAsDone(task, currentUser);
  const showValidate = canValidate(task, currentUser);

  const cannotCancelEl = (
    <>
      After signing up <strong>you CANNOT cancel</strong> unless you provide a
      replacement!
    </>
  );

  const signUpAsCaptain = () => {
    openConfirmationDialog({
      title: "Are you sure you want to sign up as captain?",
      content: [
        <>
          As a captain <strong>you will take lead</strong> and make sure that
          the task is carried out, e.g., driving the Q-Boat, organising other
          helpers who signed up for the task, etc.
        </>,
        cannotCancelEl,
      ],
      displayContentAsDialogContentText: true,
      confirmButtonText: "Sign Up As Captain",
      onConfirm: async () => {
        try {
          const newTask = await client.signUpForHelperTaskAsCaptain(task.id);
          refreshTask(newTask);
        } catch (ex) {
          setError(ex);
        }
      },
    });
  };

  const signUpAsHelper = () => {
    openConfirmationDialog({
      title: "Are you sure you want to sign up as helper?",
      content: cannotCancelEl,
      displayContentAsDialogContentText: true,
      confirmButtonText: "Sign Up As Helper",
      onConfirm: async () => {
        try {
          const newTask = await client.signUpForHelperTaskAsHelper(task.id);
          refreshTask(newTask);
        } catch (ex) {
          setError(ex);
        }
      },
    });
  };

  const markAsDone = () => {
    confirmationDialogComment.setImmediately("");

    openConfirmationDialog({
      title: "Are you sure you want to mark the task as done?",
      content: (
        <>
          <DialogContentText mb={2}>
            This will notify the contact that task is done to and it can be
            validated.
          </DialogContentText>
          <DialogContentText mb={2}>
            Comment (optional, e.g., no shows):
          </DialogContentText>
          {confirmationDialogCommentComponent}
        </>
      ),
      confirmButtonText: "Mark As Done",
      onConfirm: async () => {
        try {
          const newTask = await client.markHelperTaskAsDone(task.id, {
            comment: confirmationDialogComment.get(),
          });
          refreshTask(newTask);
        } catch (ex) {
          setError(ex);
        }
      },
    });
  };

  const validate = () => {
    validation.helpersToValidate.current = task.helpers;
    validation.helpersToRemove.current = [];
    confirmationDialogComment.setImmediately("");

    openConfirmationDialog({
      title: "Are you sure you want to validate the task?",
      content: (
        <>
          {task.helpers.length > 0 && helperValidationComponent}
          <DialogContentText mb={2}>Comment (optional):</DialogContentText>
          {confirmationDialogCommentComponent}
        </>
      ),
      confirmButtonText: "Validate",
      onConfirm: async () => {
        try {
          const newTask = await client.validateHelperTask(task.id, {
            helpersToValidate: validation.helpersToValidate.current,
            helpersToRemove: validation.helpersToRemove.current,
            comment: confirmationDialogComment.get(),
          });
          refreshTask(newTask);
        } catch (ex) {
          setError(ex);
        }
      },
    });
  };

  return (
    <>
      <PageTitleWithTaskActions value={task.title} task={task} />
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
        Contact: {createMemberDialogLink(task.contact)}
      </SpacedTypography>
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
        <SpacedTypography>
          Captain: {createMemberDialogLink(task.captain.member)}
        </SpacedTypography>
      )}
      {task.helpers.length > 0 && (
        <SpacedTypography>
          Helpers:
          {task.helpers.map((helper) => (
            <React.Fragment key={helper.member.id}>
              {" "}
              {createMemberDialogLink(helper.member)}
            </React.Fragment>
          ))}
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

      {(showSignUpAsCaptain ||
        showSignUpAsHelper ||
        showMarkAsDone ||
        showValidate) && (
        <>
          <Stack direction="row" spacing={2}>
            {showSignUpAsCaptain && (
              <Button
                variant="contained"
                color="primary"
                onClick={signUpAsCaptain}
              >
                Sign Up As Captain
              </Button>
            )}

            {showSignUpAsHelper && (
              <Button
                variant="contained"
                color="primary"
                onClick={signUpAsHelper}
              >
                Sign Up As Helper
              </Button>
            )}

            {showMarkAsDone && (
              <Button variant="contained" color="warning" onClick={markAsDone}>
                Mark As Done
              </Button>
            )}

            {showValidate && (
              <Button variant="contained" color="success" onClick={validate}>
                Validate
              </Button>
            )}
          </Stack>

          {error && (
            <SpacedBox>
              <ErrorAlert error={error} />
            </SpacedBox>
          )}

          <SpacedTypography variant="subtitle2">
            Reminder: after signing up for a task you will be unable to cancel.
            If you want to cancel a shift, first find a replacement, then notify
            Lajos Cseppentő by email, who will administer the change (and CC
            your replacement).
          </SpacedTypography>
        </>
      )}

      {memberInfoDialogComponent}
      {confirmationDialogComponent}
    </>
  );
};

export default HelperTaskInfo;
