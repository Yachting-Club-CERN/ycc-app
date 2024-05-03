import Link from '@mui/material/Link';
import {HelperTasks} from 'model/helpers-dtos';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import SpacedTypography from '@app/components/SpacedTypography';

import {createTimingInfoLine, getTaskLocation} from './helpers-utils';

type Props = {
  tasks: HelperTasks;
};

const HelperTasksReport = ({tasks}: Props) => {
  const navigate = useNavigate();

  return (
    <>
      <SpacedTypography>
        This is a simple list of the filtered tasks, ready to be copied into
        reminder emails.
      </SpacedTypography>
      <ul>
        {tasks.map(task => {
          const taskLocation = getTaskLocation(task.id);
          return (
            <li key={task.id}>
              <Link
                /* This is needed so we get a clickable link during copy-paste. */
                href={getTaskLocation(task.id)}
                /* This is needed to avoid complete page reload on navigation. */
                onClick={event => {
                  event.preventDefault();
                  navigate(taskLocation);
                }}
              >
                {createTimingInfoLine(task)} ({task.title})
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default HelperTasksReport;
