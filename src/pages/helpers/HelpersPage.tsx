import React from 'react';

import SpacedTypography from '@app/components/SpacedTypography';

import HelperTasksDataGrid from './HelperTasksDataGrid';
import PageTitleWithNewTaskButton from './PageTitleWithTaskActions';

const HelpersPage = () => {
  return (
    <>
      <PageTitleWithNewTaskButton value="Helper Tasks" />
      <SpacedTypography>
        On this page you can sign up for surveillance and maintenance tasks.
        Captain means Q-boat driver or the person who is organising the
        execution of the task.
      </SpacedTypography>
      <HelperTasksDataGrid />
    </>
  );
};

export default HelpersPage;
