import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';

import PageTitle from '@app/components/PageTitle';
import PromiseStatus from '@app/components/PromiseStatus';
import AuthenticationContext from '@app/context/AuthenticationContext';
import SharedDataContext from '@app/context/SharedDataContext';
import usePromise from '@app/hooks/usePromise';

import HelpersNewTaskForm from './HelpersNewTaskForm';

const HelpersNewTaskPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const navigate = useNavigate();
  if (!currentUser.helpersAppAdminOrEditor) {
    navigate('/helpers');
  }

  const sharedData = useContext(SharedDataContext);
  const helperTaskCategories = usePromise(sharedData.getHelperTaskCategories);
  const members = usePromise((signal?: AbortSignal) =>
    sharedData.getMembers(new Date().getFullYear(), signal)
  );
  const licenceInfos = usePromise(sharedData.getLicenceInfos);

  return (
    <>
      <PageTitle value="New Helper Task" />
      {helperTaskCategories.result && members.result && licenceInfos.result && (
        <HelpersNewTaskForm
          categories={helperTaskCategories.result}
          members={members.result}
          licenceInfos={licenceInfos.result}
        />
      )}
      <PromiseStatus outcomes={[helperTaskCategories, members, licenceInfos]} />
    </>
  );
};

export default HelpersNewTaskPage;
