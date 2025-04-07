import { useMemo } from "react";

import { User } from "@/context/auth/AuthenticationContext";
import useCurrentUser from "@/context/auth/useCurrentUser";
import usePromise, { PromiseOutcome } from "@/hooks/usePromise";
import { MemberPublicInfo } from "@/model/dtos";
import { HelperTask, HelperTaskState } from "@/model/helpers-dtos";
import client from "@/utils/client";
import {
  searchAnyStringProperty,
  searchMemberUsernameOrName,
} from "@/utils/search-utils";

import {
  canSignUp,
  isContact,
  isHappeningNow,
  isSignedUp,
  isUpcoming,
} from "./helpers-utils";

export type HelperTaskFilterOptions = {
  year: number | null;
  search?: string;
  showOnlyUpcoming?: boolean;
  showOnlyContactOrSignedUp?: boolean;
  showOnlyAvailable?: boolean;
  showOnlyUnpublished?: boolean;
  states?: HelperTaskState[];
};

const filterSearchMember = (
  searchToken: string,
  member?: MemberPublicInfo,
): boolean =>
  (member && searchMemberUsernameOrName(searchToken, member)) ?? false;

const filterSearchTask = (searchToken: string, task: HelperTask): boolean =>
  task.category.title.toLowerCase().includes(searchToken) ||
  filterSearchMember(searchToken, task.contact) ||
  filterSearchMember(searchToken, task.captain?.member) ||
  task.helpers.some((helper) =>
    filterSearchMember(searchToken, helper.member),
  ) ||
  // Also searches HelperTask.searchString
  searchAnyStringProperty(searchToken, task);

const filterSearch = (
  search: string,
  tasks: Readonly<HelperTask[]>,
): Readonly<HelperTask[]> => {
  // The user might want to search for a combination of things such as "J80 maintenance jib" or "MicMac Tim"
  const searchTokens = search.toLowerCase().trim().split(/\s+/).filter(Boolean);

  if (searchTokens.length === 0) {
    return tasks;
  }

  return tasks.filter((task) =>
    searchTokens.every((token) => filterSearchTask(token, task)),
  );
};

const filterFlags = (
  filterOptions: HelperTaskFilterOptions,
  currentUser: User,
  tasks: Readonly<HelperTask[]>,
): Readonly<HelperTask[]> => {
  let filtered = tasks;

  if (filterOptions.showOnlyUpcoming) {
    filtered = filtered.filter(
      (task) => isHappeningNow(task) || isUpcoming(task),
    );
  }

  if (filterOptions.showOnlyContactOrSignedUp) {
    filtered = filtered.filter(
      (task) => isContact(task, currentUser) || isSignedUp(task, currentUser),
    );
  }

  if (filterOptions.showOnlyAvailable) {
    filtered = filtered.filter((task) => canSignUp(task, currentUser));
  }

  if (filterOptions.showOnlyUnpublished) {
    filtered = filtered.filter((task) => !task.published);
  }

  if (filterOptions.states !== undefined) {
    filtered = filtered.filter((task) =>
      filterOptions.states?.includes(task.state),
    );
  }

  return filtered;
};

const filter = (
  filterOptions: HelperTaskFilterOptions,
  user: User,
  tasks: Readonly<HelperTask[]>,
): Readonly<HelperTask[]> => {
  let filtered = filterFlags(filterOptions, user, tasks);

  if (filterOptions.search) {
    filtered = filterSearch(filterOptions.search, filtered);
  }

  return filtered;
};

export const useFilteredHelperTasks = (
  filterOptions: HelperTaskFilterOptions,
): PromiseOutcome<Readonly<HelperTask[]>> => {
  const currentUser = useCurrentUser();
  const tasks = usePromise(
    (signal?: AbortSignal) =>
      client.helpers.getTasks(filterOptions.year, signal),
    [filterOptions.year],
  );

  const filteredTasks = useMemo(() => {
    return tasks.result
      ? filter(filterOptions, currentUser, tasks.result)
      : undefined;
  }, [tasks.result, filterOptions, currentUser]);

  return {
    result: filteredTasks,
    pending: tasks.pending,
    error: tasks.error,
  };
};
