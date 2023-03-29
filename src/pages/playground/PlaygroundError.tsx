import Typography from '@mui/material/Typography';
import React, {useEffect} from 'react';

import PageTitle from '@app/components/PageTitle';

const PlaygroundError = () => {
  useEffect(() => {
    throw new Error('This is an error...', {
      cause: '... and this is the cause',
    });
  }, []);

  return (
    <>
      <PageTitle value="Playground: Error" />
      <Typography>Wait for it...</Typography>
    </>
  );
};

export default PlaygroundError;
