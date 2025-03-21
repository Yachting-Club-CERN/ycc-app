import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import PageTitle, { PageTitleProps } from "@/components/PageTitle";
import AuthenticationContext from "@/context/AuthenticationContext";
import { HelperTask } from "@/model/helpers-dtos";

import {
  canEditTask,
  getTaskCloneLocation,
  getTaskEditLocation,
} from "./helpers-utils";

type Props = PageTitleProps & {
  task?: HelperTask;
};

const PageTitleWithTaskActions = (props: Props) => {
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
              to={`${getTaskEditLocation(props.task.id)}`}
              sx={{ ml: 2 }}
            >
              Edit Task
            </Button>
          )}
          {props.task?.id && (
            <Button
              variant="contained"
              component={RouterLink}
              to={`${getTaskCloneLocation(props.task.id)}`}
              sx={{ ml: 2 }}
            >
              Clone Task
            </Button>
          )}
        </Box>
      )}
    </Stack>
  );
};

export default PageTitleWithTaskActions;
