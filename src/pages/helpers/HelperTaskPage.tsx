import {HelperTask} from 'model/helpers-dtos';
import React, {useState} from 'react';
import {useParams} from 'react-router-dom';

import PromiseStatus from '@app/components/PromiseStatus';
import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
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
  const task = usePromise(getHelperTask, [id]);
  const [updatedTask, setUpdatedTask] = useState<HelperTask>();
  const taskToDisplay = updatedTask ? updatedTask : task.result;

  return (
    <ReadingFriendlyBox>
      {taskToDisplay && (
        <HelperTaskInfo task={taskToDisplay} refreshTask={setUpdatedTask} />
      )}
      {!taskToDisplay && <PromiseStatus outcomes={[task]} />}
    </ReadingFriendlyBox>
  );
};

export default HelperTaskPage;
