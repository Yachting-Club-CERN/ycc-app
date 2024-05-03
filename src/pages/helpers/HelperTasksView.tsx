import {MemberPublicInfo} from 'model/dtos';
import {HelperTasks} from 'model/helpers-dtos';
import React, {useContext} from 'react';

import PromiseStatus from '@app/components/PromiseStatus';
import AuthenticationContext from '@app/context/AuthenticationContext';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';
import {
  searchAnyStringProperty,
  searchMemberUsernameOrName,
} from '@app/utils/search-utils';

import HelperTasksDataGrid from './HelperTasksDataGrid';
import HelperTasksReport from './HelperTasksReport';
import {
  HelperTaskFilterOptions,
  canSignUp,
  isContact,
  isHappeningNow,
  isSignedUp,
  isUpcoming,
} from './helpers-utils';

type Props = {
  display: 'grid' | 'report';
  filterOptions: HelperTaskFilterOptions;
};

const HelperTasksView = ({display, filterOptions}: Props) => {
  const tasks = usePromise(
    (signal?: AbortSignal) => client.getHelperTasks(filterOptions.year, signal),
    [filterOptions.year]
  );
  const currentUser = useContext(AuthenticationContext).currentUser;

  const filterSearchMember = (searchToken: string, member?: MemberPublicInfo) =>
    (member && searchMemberUsernameOrName(searchToken, member)) ?? false;

  const filterSearch = (search: string, tasks: HelperTasks) => {
    // The user might want to search for a combination of things such as "J80 maintenance jib" or "MicMac Tim"
    const searchTokens = search
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map(s => s.trim())
      .filter(s => s);

    if (searchTokens) {
      return tasks.filter(task => {
        return searchTokens.every(token => {
          return (
            task.category.title.toLowerCase().includes(token) ||
            filterSearchMember(token, task.contact) ||
            filterSearchMember(token, task.captain?.member) ||
            task.helpers.some(helper =>
              filterSearchMember(token, helper.member)
            ) ||
            searchAnyStringProperty(token, task)
          );
        });
      });
    } else {
      return tasks;
    }
  };

  const filter = (tasks: HelperTasks) => {
    return filterSearch(
      filterOptions.search,
      tasks
        .filter(task =>
          filterOptions.showOnlyUpcoming
            ? isHappeningNow(task) || isUpcoming(task)
            : true
        )
        .filter(task =>
          filterOptions.showOnlyContactOrSignedUp
            ? isContact(task, currentUser) || isSignedUp(task, currentUser)
            : true
        )
        .filter(task =>
          filterOptions.showOnlyAvailable ? canSignUp(task, currentUser) : true
        )
        .filter(task =>
          filterOptions.showOnlyUnpublished ? !task.published : true
        )
        .filter(task => filterOptions.states.includes(task.state))
    );
  };

  const filteredTasks = tasks.result && filter(tasks.result);

  return (
    <>
      {filteredTasks && display === 'grid' && (
        <HelperTasksDataGrid tasks={filteredTasks} />
      )}
      {filteredTasks && display === 'report' && (
        <HelperTasksReport tasks={filteredTasks} />
      )}

      <PromiseStatus outcomes={[tasks]} />
    </>
  );
};

export default HelperTasksView;
