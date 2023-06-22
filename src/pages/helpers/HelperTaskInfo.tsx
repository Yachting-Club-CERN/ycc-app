import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import {MemberPublicInfo} from 'model/dtos';
import {HelperTask} from 'model/helpers-dtos';
import React, {useContext} from 'react';
import {useErrorBoundary} from 'react-error-boundary';
import {Link as RouterLink} from 'react-router-dom';

import SpacedTypography from '@app/components/SpacedTypography';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useMemberInfoDialog from '@app/hooks/useMemberInfoDialog';
import client from '@app/utils/client';
import {sanitiseHtmlForReact} from '@app/utils/html-utils';

import PageTitleWithNewTaskButton from './PageTitleWithNewTaskButton';
import {
  canSignUpAsCaptain,
  canSignUpAsHelper,
  createTimingInfoFragment,
} from './helpers-utils';

type Params = {
  task: HelperTask;
  refreshTask: (task: HelperTask) => void;
};

const HelperTaskInfo = ({task, refreshTask}: Params) => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const {showBoundary} = useErrorBoundary();
  const {memberInfoDialogComponent, openMemberInfoDialog} =
    useMemberInfoDialog();

  const createMemberDialogLink = (member: MemberPublicInfo) => {
    return (
      <Link onClick={() => openMemberInfoDialog(member)}>
        {member.username}
      </Link>
    );
  };

  const showSignUpAsCaptain = canSignUpAsCaptain(task, currentUser);
  const showSignUpAsHelper = canSignUpAsHelper(task, currentUser);

  const signUpAsCaptain = async () => {
    // TODO #20 This is very basic
    try {
      const newTask = await client.signUpForHelperTaskAsCaptain(task.id);
      refreshTask(newTask);
    } catch (ex) {
      showBoundary(ex);
    }
  };

  const signUpAsHelper = async () => {
    // TODO #20 This is very basic
    try {
      const newTask = await client.signUpForHelperTaskAsHelper(task.id);
      refreshTask(newTask);
    } catch (ex) {
      showBoundary(ex);
    }
  };

  return (
    <>
      <PageTitleWithNewTaskButton value={task.title} task={task} />
      <SpacedTypography variant="h3">
        Category: {task.category.title}
      </SpacedTypography>
      <SpacedTypography variant="body2">
        <Link component={RouterLink} to="/helpers">
          ← Back to the task list
        </Link>
      </SpacedTypography>
      <SpacedTypography>{createTimingInfoFragment(task)}</SpacedTypography>
      {task.urgent && (
        <SpacedTypography variant="h6" color="error">
          Urgent
        </SpacedTypography>
      )}

      <Divider sx={{mt: 2}} />

      <SpacedTypography>{task.shortDescription}</SpacedTypography>

      <Divider sx={{mt: 2}} />

      {task.longDescription && (
        <>
          <SpacedTypography>
            {sanitiseHtmlForReact(task.longDescription)}
          </SpacedTypography>
          <Divider sx={{mt: 2}} />
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
        Helpers needed (apart from captain):{' '}
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
          {task.helpers.map(helper => (
            <React.Fragment key={helper.member.id}>
              {' '}
              {createMemberDialogLink(helper.member)}
            </React.Fragment>
          ))}
        </SpacedTypography>
      )}

      {(showSignUpAsCaptain || showSignUpAsHelper) && (
        <>
          <Stack direction="row" spacing={2}>
            {showSignUpAsCaptain && (
              <Button
                variant="contained"
                color="primary"
                onClick={signUpAsCaptain}
              >
                Sign up as Captain
              </Button>
            )}

            {showSignUpAsHelper && (
              <Button
                variant="contained"
                color="primary"
                onClick={signUpAsHelper}
              >
                Sign up as Helper
              </Button>
            )}
          </Stack>
          <SpacedTypography variant="subtitle2">
            Reminder: after signing up to a task you will be unable to cancel.
            If you want to cancel a shift, first find a replacement, then notify
            Lajos Cseppentő by e-mail, who will administer the change (and CC
            your replacement).
          </SpacedTypography>
        </>
      )}

      {memberInfoDialogComponent}
    </>
  );
};

export default HelperTaskInfo;
