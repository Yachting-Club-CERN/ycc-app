import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import React from 'react';

import getErrorText from '@app/utils/error-helper';

import SpacedTypopgraphy from './SpacedTypography';

type Props = {
  error: unknown;
  fatal?: boolean;
};

const ErrorAlert = ({error, fatal}: Props) => {
  return (
    <Alert severity="error">
      <AlertTitle>
        {fatal
          ? 'Oops, something went terribly wrong :-('
          : 'Oops, something went wrong...'}
      </AlertTitle>
      <SpacedTypopgraphy sx={{whiteSpace: 'pre-wrap'}}>
        {getErrorText(error)}
      </SpacedTypopgraphy>
    </Alert>
  );
};

export default ErrorAlert;
