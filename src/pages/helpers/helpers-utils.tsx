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
  const startInFutureOrMissing = task.startsAt
    ? new Date(task.startsAt) > now
    : true;
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

  if (task.deadline && !task.startsAt && !task.endsAt) {
    return (
      <>
        <SpanBlockBox sx={{color: 'warning.main', fontWeight: 'bold'}}>
          Deadline{extraTimingTitle}
        </SpanBlockBox>
        <SpanBlockBox>{formatDateWithDay(task.deadline)}</SpanBlockBox>
        <SpanBlockBox>{formatTime(task.deadline)}</SpanBlockBox>
      </>
    );
  } else if (task.startsAt && task.endsAt) {
    const sameDayEnd =
      new Date(task.startsAt).getDate() === new Date(task.endsAt).getDate();
    if (sameDayEnd) {
      return (
        <>
          <SpanBlockBox sx={{color: 'info.main', fontWeight: 'bold'}}>
            Shift{extraTimingTitle}
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
        <SpanBlockBox>Start: {task.startsAt ?? '-'}</SpanBlockBox>
        <SpanBlockBox>End: {task.endsAt ?? '-'}</SpanBlockBox>
        <SpanBlockBox>Deadline: {task.deadline ?? '-'}</SpanBlockBox>
      </>
    );
  }
};
