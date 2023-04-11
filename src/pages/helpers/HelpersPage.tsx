import React from 'react';

import PageTitle from '@app/components/PageTitle';
import SpacedTypography from '@app/components/SpacedTypography';

import HelperTasksDataGrid from './HelperTasksDataGrid';

const HelpersPage = () => {
  return (
    <>
      <PageTitle value="Helper Tasks" />
      <SpacedTypography>
        On this page you can subscribe to surveillance and maintenance tasks.
        Captain means Q-boat driver or the person who is organising the
        execution the maintenance task.
      </SpacedTypography>
      <HelperTasksDataGrid />
    </>
  );
};

export default HelpersPage;
