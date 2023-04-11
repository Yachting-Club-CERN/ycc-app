import {HelperTask} from 'model/helpers-dtos';
import React from 'react';

import SpanBlockBox from '@app/components/SpanBlockBox';
import {User} from '@app/context/AuthenticationContext';
import {
  formatDateTime,
  formatDateWithDay,
  formatTime,
} from '@app/utils/date-utils';

export const isUpcomingTask = (task: HelperTask): boolean => {
  const now = new Date();
  const startInFutureOrMissing = task.start ? new Date(task.start) > now : true;
  const deadlineInFutureOrMissing = task.deadline
    ? new Date(task.deadline) > now
    : true;
  return startInFutureOrMissing && deadlineInFutureOrMissing;
};

export const isSubscribedAsCaptain = (task: HelperTask, user: User): boolean =>
  task.captain?.member.username === user.username;

export const isSubscribedAsHelper = (task: HelperTask, user: User): boolean =>
  task.helpers.some(helper => helper.member.username === user.username);

export const isSubscribed = (task: HelperTask, user: User): boolean =>
  isSubscribedAsCaptain(task, user) || isSubscribedAsHelper(task, user);

export const canSubscribeAsCaptain = (task: HelperTask, user: User): boolean =>
  isUpcomingTask(task) &&
  !task.captain &&
  !isSubscribedAsHelper(task, user) &&
  (!task.captainRequiredLicence ||
    user.hasLicence(task.captainRequiredLicence.licence));

export const canSubscribeAsHelper = (task: HelperTask, user: User): boolean =>
  isUpcomingTask(task) &&
  task.helpers.length < task.helpersMaxCount &&
  !isSubscribedAsCaptain(task, user) &&
  !isSubscribedAsHelper(task, user);

export const canSubscribe = (task: HelperTask, user: User): boolean =>
  canSubscribeAsCaptain(task, user) || canSubscribeAsHelper(task, user);

export const fakeRandomSignupText = (taskId: number, captain: boolean) => {
  const texts = [
    'Sign me up!',
    'Sign me up!',
    'I am in!',
    'I will help!',
    'I will do it!',
  ];
  return texts[(taskId * (captain ? 2 : 1) * 92173) % texts.length];
};

export const createTimingNode = (task: HelperTask) => {
  if (task.deadline && !task.start && !task.end) {
    return (
      <>
        <SpanBlockBox sx={{color: 'warning.main', fontWeight: 'bold'}}>
          Deadline
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
            Shift
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
            Multi-day Shift
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
