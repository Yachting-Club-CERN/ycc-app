import React, {useEffect} from 'react';

import PageTitle from '@app/components/PageTitle';
import SpacedTypography from '@app/components/SpacedTypography';

const PlaygroundError = () => {
  useEffect(() => {
    throw new Error('This is an error...', {
      cause: '... and this is the cause',
    });
  }, []);

  return (
    <>
      <PageTitle value="Playground: Error" />
      <SpacedTypography>Wait for it...</SpacedTypography>
    </>
  );
};

export default PlaygroundError;
