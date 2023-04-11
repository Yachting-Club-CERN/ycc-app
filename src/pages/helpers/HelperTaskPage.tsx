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
      throw new Error('Invalid task id');
    } else {
      return client.getHelperTaskById(task_id, signal);
    }
  };
  const {result: task, error, pending} = usePromise(getHelperTask);
  const [updatedTask, setUpdatedTask] = React.useState<HelperTask>();
  const displayTask = updatedTask ? updatedTask : task;

  return (
    <>
      {displayTask && (
        <HelperTaskInfo task={displayTask} refreshTask={setUpdatedTask} />
      )}
      {error && !updatedTask && <ErrorAlert error={error} />}
      {pending && !updatedTask && <CircularProgress />}
    </>
  );
};

export default HelperTaskPage;
