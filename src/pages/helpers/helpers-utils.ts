import { User } from "@/context/AuthenticationContext";
import {
  HelperTask,
  HelperTaskMutationRequestBase,
  HelperTaskState,
  HelperTaskType,
  getHelperTaskType,
} from "@/model/helpers-dtos";
import { getNow, isSameDay } from "@/utils/date-utils";
export type HelperTaskFilterOptions = {
  year: number | null;
  search: string;
  showOnlyUpcoming: boolean;
  showOnlyContactOrSignedUp: boolean;
  showOnlyAvailable: boolean;
  showOnlyUnpublished: boolean;
  states: HelperTaskState[];
};

/**
 * Returns the location of a task's page.
 *
 * @param taskId task id
 * @returns task location
 */
export const getTaskLocation = (taskId: number) => `/helpers/tasks/${taskId}`;

/**
 * Returns the location of a task's edit page.
 *
 * @param taskId task id
 * @returns task edit location
 */
export const getTaskEditLocation = (taskId: number) =>
  `${getTaskLocation(taskId)}/edit`;

/**
 * Returns the location of a task's clone page.
 *
 * @param taskId task id
 * @returns task clone location
 */
export const getTaskCloneLocation = (taskId: number) =>
  `/helpers/tasks/new?from=${taskId}`;

/**
 * Tells if a shift is multi-day shift.
 *
 * @param task a task
 * @returns true if the task is a multi-day shift, false otherwise
 */
export const isMultiDayShift = (
  task: HelperTask | HelperTaskMutationRequestBase,
): boolean =>
  getHelperTaskType(task) === HelperTaskType.Shift &&
  !isSameDay(task.startsAt!, task.endsAt!);

/**
 * Tells if a shift is happening right now.
 *
 * @param task a task
 * @returns true if the task is a shift and it is happening right now, false otherwise
 */
export const isHappeningNow = (task: HelperTask): boolean => {
  const now = getNow();
  if (task.type === HelperTaskType.Shift) {
    return now.isAfter(task.startsAt) && now.isBefore(task.endsAt);
  } else {
    return false;
  }
};

/**
 * Tells if a task is in the future.
 *
 * @param task a task
 * @returns true if the task is in the future, false otherwise
 */
export const isUpcoming = (task: HelperTask): boolean => {
  const now = getNow();
  const startInFutureOrMissing = task.startsAt
    ? task.startsAt.isAfter(now)
    : true;
  const deadlineInFutureOrMissing = task.deadline
    ? task.deadline.isAfter(now)
    : true;
  return startInFutureOrMissing && deadlineInFutureOrMissing;
};

/**
 * Tells if a user is the contact of a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user is the contact, false otherwise
 */
export const isContact = (task: HelperTask, user: User): boolean =>
  task.contact.username === user.username;

/**
 * Tells if a user is signed up for a task as captain.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user is signed up as captain, false otherwise
 */
export const isSignedUpAsCaptain = (task: HelperTask, user: User): boolean =>
  task.captain?.member.username === user.username;

/**
 * Tells if a user is signed up for a task as helper.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user is signed up as helper, false otherwise
 */
export const isSignedUpAsHelper = (task: HelperTask, user: User): boolean =>
  task.helpers.some((helper) => helper.member.username === user.username);

/**
 * Tells if a user has signed up for a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user has signed up, false otherwise
 */
export const isSignedUp = (task: HelperTask, user: User): boolean =>
  isSignedUpAsCaptain(task, user) || isSignedUpAsHelper(task, user);

/**
 * Tells whether a user can sign up for a task as captain.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can sign up as captain, false otherwise
 */
export const canSignUpAsCaptain = (task: HelperTask, user: User): boolean =>
  isUpcoming(task) &&
  task.published &&
  task.state === HelperTaskState.Pending &&
  !task.captain &&
  !isSignedUpAsHelper(task, user) &&
  (!task.captainRequiredLicenceInfo ||
    user.hasLicence(task.captainRequiredLicenceInfo.licence));

/**
 * Tells whether a user can sign up for a task as helper.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can sign up as helper, false otherwise
 */
export const canSignUpAsHelper = (task: HelperTask, user: User): boolean =>
  isUpcoming(task) &&
  task.published &&
  task.state === HelperTaskState.Pending &&
  task.helpers.length < task.helperMaxCount &&
  !isSignedUpAsCaptain(task, user) &&
  !isSignedUpAsHelper(task, user);

/**
 * Tells whether a user can edit a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can edit the task, false otherwise
 */
export const canEdit = (task: HelperTask, user: User): boolean =>
  user.helpersAppAdmin || (user.helpersAppEditor && isContact(task, user));

/**
 * Tells whether a user can sign up for a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can sign up, false otherwise
 */
export const canSignUp = (task: HelperTask, user: User): boolean =>
  canSignUpAsCaptain(task, user) || canSignUpAsHelper(task, user);

/**
 * Tells whether a user can add or remove members from a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can add or remove members, false otherwise
 */
export const canAddOrRemoveMembers = (task: HelperTask, user: User): boolean =>
  canEdit(task, user) && task.published;

/**
 * Tells whether a user can set the captain of a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can set the captain, false otherwise
 */
export const canSetCaptain = (task: HelperTask, user: User): boolean =>
  canAddOrRemoveMembers(task, user) && !task.captain;

/**
 * Tells whether a user can add a helper to a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can add a helper, false otherwise
 */
export const canAddHelper = (task: HelperTask, user: User): boolean =>
  canAddOrRemoveMembers(task, user) &&
  task.helpers.length < task.helperMaxCount;

/**
 * Tells whether a user can mark a task as done.
 *
 * @param task  a task
 * @param user  a user
 * @returns  true if the user can mark the task as done, false otherwise
 */
export const canMarkAsDone = (task: HelperTask, user: User): boolean =>
  task.published &&
  !(task.type === HelperTaskType.Shift && isUpcoming(task)) &&
  task.state === HelperTaskState.Pending &&
  (user.helpersAppAdmin ||
    isContact(task, user) ||
    isSignedUpAsCaptain(task, user));

/**
 * Tells whether a user can validate a task.
 *
 * @param task  a task
 * @param user  a user
 * @returns  true if the user can validate the task, false otherwise
 */
export const canValidate = (task: HelperTask, user: User): boolean =>
  task.published &&
  !(task.type === HelperTaskType.Shift && isUpcoming(task)) &&
  task.state !== HelperTaskState.Validated &&
  (user.helpersAppAdmin || isContact(task, user));
