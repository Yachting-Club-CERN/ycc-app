import CircularProgress from '@mui/material/CircularProgress';
import {HelperTask} from 'model/helpers-dtos';
import React from 'react';
import {useParams} from 'react-router-dom';

import ErrorAlert from '@app/components/ErrorAlert';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';

import HelperTaskInfo from './HelperTaskInfo';

const HelperTaskPage = () => {
  const {id} = useParams();
  const getHelperTask = (signal?: AbortSignal) => {
    const task_id = parseInt(id ?? 'NaN');
    if (isNaN(task_id)) {
      throw new Error('Invalid task ID');
    } else {
      return client.getHelperTaskById(task_id, signal);
    }
  };
  const {result: task, error, pending} = usePromise(getHelperTask);
  const [updatedTask, setUpdatedTask] = React.useState<HelperTask>();
  const taskToDisplay = updatedTask ? updatedTask : task;

  return (
    <>
      {taskToDisplay && (
        <HelperTaskInfo task={taskToDisplay} refreshTask={setUpdatedTask} />
      )}
      {error && !taskToDisplay && <ErrorAlert error={error} />}
      {pending && !taskToDisplay && <CircularProgress />}
    </>
  );
};

export default HelperTaskPage;
