import {HelperTask} from 'model/helpers-dtos';
import React from 'react';

import SpanBlockBox from '@app/components/SpanBlockBox';
import {User} from '@app/context/AuthenticationContext';
import {
  formatDateTime,
  formatDateWithDay,
  formatTime,
} from '@app/utils/date-utils';

/**
 * Tells if a task is in the future.
 *
 * @param task a task
 * @returns true if the task is in the future, false otherwise
 */
export const isUpcoming = (task: HelperTask): boolean => {
  const now = new Date();
  const startInFutureOrMissing = task.start ? new Date(task.start) > now : true;
  const deadlineInFutureOrMissing = task.deadline
    ? new Date(task.deadline) > now
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
 * Tells if a user is subscribed to a task as captain.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user is subscribed as captain, false otherwise
 */
export const isSubscribedAsCaptain = (task: HelperTask, user: User): boolean =>
  task.captain?.member.username === user.username;

/**
 * Tells if a user is subscribed to a task as helper.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user is subscribed as helper, false otherwise
 */
export const isSubscribedAsHelper = (task: HelperTask, user: User): boolean =>
  task.helpers.some(helper => helper.member.username === user.username);

/**
 * Tells if a user is subscribed to a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user is subscribed, false otherwise
 */
export const isSubscribed = (task: HelperTask, user: User): boolean =>
  isSubscribedAsCaptain(task, user) || isSubscribedAsHelper(task, user);

/**
 * Tells whether a user can subscribe to a task as captain.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can subscribe as captain, false otherwise
 */
export const canSubscribeAsCaptain = (task: HelperTask, user: User): boolean =>
  isUpcoming(task) &&
  task.published &&
  !task.captain &&
  !isSubscribedAsHelper(task, user) &&
  (!task.captainRequiredLicenceInfo ||
    user.hasLicence(task.captainRequiredLicenceInfo.licence));

/**
 * Tells whether a user can subscribe to a task as helper.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can subscribe as helper, false otherwise
 */
export const canSubscribeAsHelper = (task: HelperTask, user: User): boolean =>
  isUpcoming(task) &&
  task.published &&
  task.helpers.length < task.helpersMaxCount &&
  !isSubscribedAsCaptain(task, user) &&
  !isSubscribedAsHelper(task, user);

/**
 * Tells whether a user can subscribe to a task.
 *
 * @param task a task
 * @param user a user
 * @returns true if the user can subscribe, false otherwise
 */
export const canSubscribe = (task: HelperTask, user: User): boolean =>
  canSubscribeAsCaptain(task, user) || canSubscribeAsHelper(task, user);

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
 * Gives a "fake random" subscribe text. Deterministic.
 *
 * @returns a subscribe text
 */
export const fakeRandomSubscribeText = (taskId: number, captain: boolean) => {
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

  if (task.deadline && !task.start && !task.end) {
    return (
      <>
        <SpanBlockBox sx={{color: 'warning.main', fontWeight: 'bold'}}>
          Deadline{extraTimingTitle}
        </SpanBlockBox>
        <SpanBlockBox>{formatDateWithDay(task.deadline)}</SpanBlockBox>
        <SpanBlockBox>{formatTime(task.deadline)}</SpanBlockBox>
      </>
    );
  } else if (task.start && task.end) {
    const sameDayEnd =
      new Date(task.start).getDate() === new Date(task.end).getDate();
    if (sameDayEnd) {
      return (
        <>
          <SpanBlockBox sx={{color: 'info.main', fontWeight: 'bold'}}>
            Shift{extraTimingTitle}
          </SpanBlockBox>
          <SpanBlockBox>{formatDateWithDay(task.start)}</SpanBlockBox>
          <SpanBlockBox>
            {formatTime(task.start)} -- {formatTime(task.end)}
          </SpanBlockBox>
        </>
      );
    } else {
      // Note: this we did not have at all before 2023, not sure whether it would be used
      return (
        <>
          <SpanBlockBox sx={{color: 'info.main', fontWeight: 'bold'}}>
            Multi-Day Shift{extraTimingTitle}
          </SpanBlockBox>
          <SpanBlockBox>Start: {formatDateTime(task.start)}</SpanBlockBox>
          <SpanBlockBox>End: {formatDateTime(task.end)}</SpanBlockBox>
        </>
      );
    }
  } else {
    // Fallback for inconsistent data
    return (
      <>
        <SpanBlockBox>Start: {task.start ?? '-'}</SpanBlockBox>
        <SpanBlockBox>End: {task.end ?? '-'}</SpanBlockBox>
        <SpanBlockBox>Deadline: {task.deadline ?? '-'}</SpanBlockBox>
      </>
    );
  }
};
