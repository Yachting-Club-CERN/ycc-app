import Typography from '@mui/material/Typography';
import React from 'react';
import {useLocation} from 'react-router-dom';

import PageTitle from '@app/components/PageTitle';
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
      <Typography padding={2}>
        The page you are looking for does not seem to exist. No worries though,
        our boats are definitely found in Versoix (at least during the season).
        😉🌊⛵🎉
      </Typography>
      <Typography padding={2}>
        If you feel the boogie you can send this to the IT helpers:
      </Typography>
      <Typography padding={2} style={{whiteSpace: 'pre-wrap'}}>
        {toJson(debug)}
      </Typography>
    </>
  );
};

export default NotFound;
