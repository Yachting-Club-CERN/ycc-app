import dayjs from 'dayjs/esm/index.js';
import {HelperTask, HelperTaskState} from 'model/helpers-dtos';
import React from 'react';

import SpanBlockBox from '@app/components/SpanBlockBox';
import {User} from '@app/context/AuthenticationContext';
import {
  formatDateTime,
  formatDateWithDay,
  formatTime,
} from '@app/utils/date-utils';

export const doneEmoji = '🚦';
export const validatedEmoji = '✔️';

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
 * Tells if a shift is happening right now.
 *
 * @param task a task
 * @returns true if the task is a shift and it is happening right now, false otherwise
 */
export const isHappeningNow = (task: HelperTask): boolean => {
  const now = dayjs();
  if (task.startsAt && task.endsAt) {
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
  const now = dayjs();
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
  task.helpers.some(helper => helper.member.username === user.username);

/**
 * Tells if a user is signed up for a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user is signed up, false otherwise
 */
export const isSignedUp = (task: HelperTask, user: User): boolean =>
  isSignedUpAsCaptain(task, user) || isSignedUpAsHelper(task, user);

/**
 * Tells whether a user can signed up for a task as captain.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can signed up as captain, false otherwise
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
 * Tells whether a user can sign up for a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can sign up, false otherwise
 */
export const canSignUp = (task: HelperTask, user: User): boolean =>
  canSignUpAsCaptain(task, user) || canSignUpAsHelper(task, user);

/**
 * Tells whether a user can edit a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can edit the task, false otherwise
 */
export const canEditTask = (task: HelperTask, user: User): boolean =>
  user.helpersAppAdmin || (user.helpersAppEditor && isContact(task, user));

/**
 * Tells whether a user can mark a task as done.
 *
 * @param task  a task
 * @param user  a user
 * @returns  true if the user can mark the task as done, false otherwise
 */
export const canMarkTaskAsDone = (task: HelperTask, user: User): boolean =>
  task.published &&
  task.state === HelperTaskState.Pending &&
  (user.helpersAppAdmin ||
    isContact(task, user) ||
    isSignedUpAsCaptain(task, user));

/**
 *  Tells whether a user can validate a task.
 * @param task  a task
 * @param user  a user
 * @returns  true if the user can validate the task, false otherwise
 */
export const canValidate = (task: HelperTask, user: User): boolean =>
  task.published &&
  task.state !== HelperTaskState.Validated &&
  (user.helpersAppAdmin || isContact(task, user));

/**
 * Gives a "fake random" sign up text. Deterministic.
 *
 * @returns a sign up text
 */
export const fakeRandomSignUpText = (taskId: number, captain: boolean) => {
  const texts = [
    // You want to keep the length of this array a prime number for best results
    'Sign me up!',
    'Sign me up!',
    'I am in!',
    'I will help!',
    'I will do it!',
  ];
  return texts[(taskId * (captain ? 2 : 1) * 92173) % texts.length];
};

/**
 * Returns the status emoji for a task.
 *
 * @param task a task
 * @returns the status emoji, or empty string if the task is pending
 */
export const getStatusEmoji = (task: HelperTask): string => {
  if (task.validatedAt) {
    return validatedEmoji;
  } else if (task.markedAsDoneAt) {
    return doneEmoji;
  } else {
    return '';
  }
};

/**
 * Creates the timing info fragment for a task.
 *
 * @param task a task
 * @returns the timing info fragment
 */
export const createTimingInfoFragment = (task: HelperTask): JSX.Element => {
  let extraTimingTitle = [
    task.urgent ? 'Urgent' : '',
    task.published ? '' : 'Hidden',
  ]
    .filter(Boolean)
    .join(', ');
  if (extraTimingTitle !== '') {
    extraTimingTitle = ` (${extraTimingTitle})`;
  }

  let statusEmoji = getStatusEmoji(task);
  if (statusEmoji) {
    statusEmoji = ` ${statusEmoji}`;
  }

  if (task.deadline && !task.startsAt && !task.endsAt) {
    // Visual note: Max 3 <SpanBlockBox> should be used on each branch
    return (
      <>
        <SpanBlockBox sx={{color: 'warning.main', fontWeight: 'bold'}}>
          Deadline{extraTimingTitle}
          {statusEmoji}
        </SpanBlockBox>
        <SpanBlockBox>{formatDateWithDay(task.deadline)}</SpanBlockBox>
        <SpanBlockBox>{formatTime(task.deadline)}</SpanBlockBox>
      </>
    );
  } else if (task.startsAt && task.endsAt) {
    const sameDayEnd = task.startsAt.isSame(task.endsAt, 'day');
    if (sameDayEnd) {
      return (
        <>
          <SpanBlockBox sx={{color: 'info.main', fontWeight: 'bold'}}>
            Shift{extraTimingTitle}
            {statusEmoji}
          </SpanBlockBox>
          <SpanBlockBox>{formatDateWithDay(task.startsAt)}</SpanBlockBox>
          <SpanBlockBox>
            {formatTime(task.startsAt)} -- {formatTime(task.endsAt)}
          </SpanBlockBox>
        </>
      );
    } else {
      // Note: this we did not have at all before 2023, not sure whether it would be used
      return (
        <>
          <SpanBlockBox sx={{color: 'info.main', fontWeight: 'bold'}}>
            Multi-Day Shift{extraTimingTitle}
            {statusEmoji}
          </SpanBlockBox>
          <SpanBlockBox>Start: {formatDateTime(task.startsAt)}</SpanBlockBox>
          <SpanBlockBox>End: {formatDateTime(task.endsAt)}</SpanBlockBox>
        </>
      );
    }
  } else {
    // Fallback for inconsistent data
    return (
      <>
        <SpanBlockBox>
          Start: {formatDateTime(task.startsAt) ?? '-'}
          {statusEmoji}
        </SpanBlockBox>
        <SpanBlockBox>End: {formatDateTime(task.endsAt) ?? '-'}</SpanBlockBox>
        <SpanBlockBox>
          Deadline: {formatDateTime(task.deadline) ?? '-'}
        </SpanBlockBox>
      </>
    );
  }
};
