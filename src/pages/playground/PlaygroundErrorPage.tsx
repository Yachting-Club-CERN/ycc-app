import React, {useEffect} from 'react';

import PageTitle from '@app/components/PageTitle';
import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
import SpacedTypography from '@app/components/SpacedTypography';

const PlaygroundErrorPage = () => {
  useEffect(() => {
    throw new Error('This is an error...', {
      cause: '... and this is the cause',
    });
  }, []);

  return (
    <ReadingFriendlyBox>
      <PageTitle value="Playground: Error" />
      <SpacedTypography>Wait for it...</SpacedTypography>
    </ReadingFriendlyBox>
  );
};

export default PlaygroundErrorPage;
