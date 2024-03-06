import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSearchParams} from 'react-router-dom';

import PageTitle from '@app/components/PageTitle';
import PromiseStatus from '@app/components/PromiseStatus';
import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
import AuthenticationContext from '@app/context/AuthenticationContext';
import SharedDataContext from '@app/context/SharedDataContext';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';
import {getCurrentYear} from '@app/utils/date-utils';

import HelpersTaskForm from './HelpersTaskForm';

const HelpersNewTaskPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const navigate = useNavigate();
  if (!currentUser.helpersAppAdminOrEditor) {
    navigate('/helpers');
  }

  const [searchParams] = useSearchParams();
  const taskToCloneId = parseInt(searchParams.get('from') ?? 'NaN');

  const getHelperTask = (signal?: AbortSignal) => {
    if (isNaN(taskToCloneId)) {
      return Promise.resolve(null);
    } else {
      return client.getHelperTaskById(taskToCloneId, signal);
    }
  };
  const taskToClone = usePromise(getHelperTask, [taskToCloneId]);

  const sharedData = useContext(SharedDataContext);
  const helperTaskCategories = usePromise(sharedData.getHelperTaskCategories);
  const members = usePromise((signal?: AbortSignal) =>
    sharedData.getMembers(getCurrentYear(), signal)
  );
  const licenceInfos = usePromise(sharedData.getLicenceInfos);

  return (
    <ReadingFriendlyBox>
      <PageTitle value="New Helper Task" />
      {taskToClone.result !== undefined &&
        helperTaskCategories.result &&
        members.result &&
        licenceInfos.result && (
          <HelpersTaskForm
            task={taskToClone.result ?? undefined}
            newTask={true}
            categories={helperTaskCategories.result}
            members={members.result}
            licenceInfos={licenceInfos.result}
          />
        )}
      <PromiseStatus
        outcomes={[taskToClone, helperTaskCategories, members, licenceInfos]}
      />
    </ReadingFriendlyBox>
  );
};

export default HelpersNewTaskPage;
