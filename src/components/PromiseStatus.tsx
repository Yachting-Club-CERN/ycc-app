import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import {PromiseOutcome} from '@app/hooks/usePromise';

import ErrorAlert from './ErrorAlert';

type Props = {
  outcomes: PromiseOutcome<unknown>[];
};

const PromiseStatus = ({outcomes}: Props) => {
  const pending = outcomes.some(outcome => outcome.pending);
  const error = outcomes.find(outcome => outcome.error)?.error;

  return (
    <>
      {error && <ErrorAlert error={error} />}
      {pending && !error && <CircularProgress />}
    </>
  );
};

export default PromiseStatus;
