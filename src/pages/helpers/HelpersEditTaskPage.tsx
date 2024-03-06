import React, {useContext} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import PageTitle from '@app/components/PageTitle';
import PromiseStatus from '@app/components/PromiseStatus';
import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
import AuthenticationContext from '@app/context/AuthenticationContext';
import SharedDataContext from '@app/context/SharedDataContext';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';
import {getCurrentYear} from '@app/utils/date-utils';

import HelpersTaskForm from './HelpersTaskForm';

const HelpersEditTaskPage = () => {
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
  const currentUser = useContext(AuthenticationContext).currentUser;
  const navigate = useNavigate();
  if (!currentUser.helpersAppAdminOrEditor) {
    navigate('/helpers');
  }

  const sharedData = useContext(SharedDataContext);
  const helperTaskCategories = usePromise(sharedData.getHelperTaskCategories);
  const members = usePromise((signal?: AbortSignal) =>
    sharedData.getMembers(getCurrentYear(), signal)
  );
  const licenceInfos = usePromise(sharedData.getLicenceInfos);

  return (
    <ReadingFriendlyBox>
      <PageTitle value="Edit Helper Task" />
      {task.result &&
        helperTaskCategories.result &&
        members.result &&
        licenceInfos.result && (
          <HelpersTaskForm
            task={task.result}
            newTask={false}
            categories={helperTaskCategories.result}
            members={members.result}
            licenceInfos={licenceInfos.result}
          />
        )}
      <PromiseStatus
        outcomes={[task, helperTaskCategories, members, licenceInfos]}
      />
    </ReadingFriendlyBox>
  );
};

export default HelpersEditTaskPage;
