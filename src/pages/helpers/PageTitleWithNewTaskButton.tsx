import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, {useContext} from 'react';
import {Link as RouterLink} from 'react-router-dom';

import PageTitle, {PageTitleProps} from '@app/components/PageTitle';
import AuthenticationContext from '@app/context/AuthenticationContext';

const PageTitleWithNewTaskButton = (pageTitleProps: PageTitleProps) => {
  const currentUser = useContext(AuthenticationContext).currentUser;

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <PageTitle {...pageTitleProps} />
      {currentUser.helpersAppAdminOrEditor && (
        <Box>
          <Button
            variant="contained"
            component={RouterLink}
            to="/helpers/tasks/new"
          >
            New Task
          </Button>
        </Box>
      )}
    </Stack>
  );
};

export default PageTitleWithNewTaskButton;
