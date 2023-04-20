import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {HelperTask} from 'model/helpers-dtos';
import React, {useContext} from 'react';
import {Link as RouterLink} from 'react-router-dom';

import PageTitle, {PageTitleProps} from '@app/components/PageTitle';
import AuthenticationContext from '@app/context/AuthenticationContext';

import {canEditTask} from './helpers-utils';

type Props = PageTitleProps & {
  task?: HelperTask;
};

const PageTitleWithNewTaskButton = (props: Props) => {
  const currentUser = useContext(AuthenticationContext).currentUser;

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <PageTitle {...props} />
      {currentUser.helpersAppAdminOrEditor && (
        <Box>
          <Button
            variant="contained"
            component={RouterLink}
            to="/helpers/tasks/new"
          >
            New Task
          </Button>
          {props.task?.id && canEditTask(props.task, currentUser) && (
            <Button
              variant="contained"
              component={RouterLink}
              to={`/helpers/tasks/${props.task.id}/edit`}
              sx={{ml: 2}}
            >
              Edit Task
            </Button>
          )}
        </Box>
      )}
    </Stack>
  );
};

export default PageTitleWithNewTaskButton;
