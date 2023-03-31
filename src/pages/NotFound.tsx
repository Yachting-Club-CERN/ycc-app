import React from 'react';
import {useLocation} from 'react-router-dom';

import PageTitle from '@app/components/PageTitle';
import SpacedTypopgraphy from '@app/components/SpacedTypography';
import toJson from '@app/utils/toJson';

const NotFound = () => {
  const location = useLocation();

  const debug = {
    problem: 'Page not found',
    windowLocation: window.location.href,
    routerLocation: location,
  };
  console.debug('Debug info: ', debug);

  return (
    <>
      <PageTitle value="Page Not Found" />
      <SpacedTypopgraphy>
        The page you are looking for does not seem to exist. No worries though,
        our boats are definitely found in Versoix (at least during the season).
        😉🌊⛵🎉
      </SpacedTypopgraphy>
      <SpacedTypopgraphy>
        If you feel the boogie you can send this to the IT Helpers:
      </SpacedTypopgraphy>
      <SpacedTypopgraphy sx={{whiteSpace: 'pre-wrap'}}>
        {toJson(debug)}
      </SpacedTypopgraphy>
    </>
  );
};

export default NotFound;
