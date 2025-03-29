import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { ComponentProps, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import PageTitle from "@/components/PageTitle";
import ShareViaEmailIconButton from "@/components/ShareViaEmailIconButton";
import ShareViaWhatsAppIconButton from "@/components/ShareViaWhatsAppIconButton";
import AuthenticationContext from "@/context/AuthenticationContext";
import { HelperTask } from "@/model/helpers-dtos";

import {
  canEditTask,
  createTimingInfoLine,
  getTaskCloneLocation,
  getTaskEditLocation,
} from "./helpers-utils";

type Props = ComponentProps<typeof PageTitle> & {
  task?: HelperTask;
};

const ShareTaskViaEmailIconButton = ({ task }: { task: HelperTask }) => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const subject = `Helper task: ${task.title}`;

  // Similar to the emails sent by ycc-hull, but uses <br /> over <p> to avoid user confusion in case they edit the email
  const body = `Dear Sailors ⛵️🥳,
<br /><br />
I wanted to share this task with you: ${task.title}
<br /><br />
<strong>${createTimingInfoLine(task)}</strong>
<br /><br />
<em>${task.shortDescription}</em>
<br /><br />
<a
    href="${window.location.href}"
    style="
        display: inline-block;
        padding: 6px 16px;
        font-size: large;
        color: #ffffff;
        background-color: #1976d2;
        text-decoration: none;
        border-radius: 4px;
    "
>
    <strong>Open in the App</strong>
</a>
<br /><br />
Cheers,<br />
${currentUser.firstName} ${currentUser.lastName}`;

  return <ShareViaEmailIconButton subject={subject} body={body} />;
};

const ShareTaskViaWhatsAppIconButton = ({ task }: { task: HelperTask }) => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const message = `Dear Sailors ⛵️🥳,

I wanted to share this task with you: ${task.title}

*${createTimingInfoLine(task)}*

_${task.shortDescription}_

Open in the App: ${window.location.href}

Cheers,
${currentUser.firstName} ${currentUser.lastName}`;

  return <ShareViaWhatsAppIconButton message={message} />;
};

const PageTitleWithTaskActions = (props: Props) => {
  const currentUser = useContext(AuthenticationContext).currentUser;

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center">
        <PageTitle {...props} />

        {props.task && (
          <>
            <Box width={8} />
            <ShareTaskViaEmailIconButton task={props.task} />
            <ShareTaskViaWhatsAppIconButton task={props.task} />
          </>
        )}
      </Stack>

      {currentUser.helpersAppAdminOrEditor && (
        <Box>
          <Button
            variant="contained"
            component={RouterLink}
            to="/helpers/tasks/new"
          >
            New Task
          </Button>
          {props.task && canEditTask(props.task, currentUser) && (
            <Button
              variant="contained"
              component={RouterLink}
              to={`${getTaskEditLocation(props.task.id)}`}
              sx={{ ml: 2 }}
            >
              Edit Task
            </Button>
          )}
          {props.task && (
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
