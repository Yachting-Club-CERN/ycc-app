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

import PageTitleWithNewTaskButton from './PageTitleWithNewTaskButton';
import {
  canSubscribeAsCaptain,
  canSubscribeAsHelper,
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

  const showSubscribeAsCaptain = canSubscribeAsCaptain(task, currentUser);
  const showSubscribeAsHelper = canSubscribeAsHelper(task, currentUser);

  const subscribeAsCaptain = async () => {
    // TODO #20 This is very basic
    try {
      const newTask = await client.subscribeToHelperTaskAsCaptain(task.id);
      refreshTask(newTask);
    } catch (ex) {
      showBoundary(ex);
    }
  };

  const subscribeAsHelper = async () => {
    // TODO #20 This is very basic
    try {
      const newTask = await client.subscribeToHelperTaskAsHelper(task.id);
      refreshTask(newTask);
    } catch (ex) {
      showBoundary(ex);
    }
  };

  return (
    <>
      <PageTitleWithNewTaskButton value={task.title} />
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
        {task.helpersMinCount === task.helpersMaxCount
          ? task.helpersMinCount
          : `${task.helpersMinCount} - ${task.helpersMaxCount}`}
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

      {(showSubscribeAsCaptain || showSubscribeAsHelper) && (
        <>
          <Stack direction="row" spacing={2}>
            {showSubscribeAsCaptain && (
              <Button
                variant="contained"
                color="primary"
                onClick={subscribeAsCaptain}
              >
                Subscribe as Captain
              </Button>
            )}

            {showSubscribeAsHelper && (
              <Button
                variant="contained"
                color="primary"
                onClick={subscribeAsHelper}
              >
                Subscribe as Helper
              </Button>
            )}
          </Stack>
          <SpacedTypography variant="subtitle2">
            Reminder: after subscribing to a task, you will be unable to
            unsubscribe. If you want to cancel a shift, first find a
            replacement, then notify Lajos Cseppentő by e-mail, who will
            administer the change (and CC your replacement).
          </SpacedTypography>
        </>
      )}

      {memberInfoDialogComponent}
    </>
  );
};

export default HelperTaskInfo;
