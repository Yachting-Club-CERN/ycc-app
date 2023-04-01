import SailingIcon from '@mui/icons-material/Sailing';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Link from '@mui/material/Link';
import React from 'react';
import {FallbackProps} from 'react-error-boundary';

import SpacedTypography from '@app/components/SpacedTypography';
import getErrorText from '@app/utils/error-helper';

const ErrorFallback = (props: FallbackProps) => {
  const error = props.error;
  const boatCount = Math.floor(Math.random() * 10) + 1;

  return (
    <Alert severity="error">
      <AlertTitle>Oops, something went terribly wrong :-(</AlertTitle>
      <SpacedTypography sx={{whiteSpace: 'pre-wrap'}}>
        {getErrorText(error)}
      </SpacedTypography>
      <SpacedTypography>
        No promise that{' '}
        <Link href="#" onClick={props.resetErrorBoundary}>
          reset
        </Link>{' '}
        will solve this issue, but worth a try...
      </SpacedTypography>
      <SpacedTypography>
        {[...Array(boatCount)].map((_, i) => (
          <SailingIcon key={i} />
        ))}
      </SpacedTypography>
    </Alert>
  );
};

export default ErrorFallback;
