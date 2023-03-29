import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';

import PageTitle from '@app/components/PageTitle';

const Home = () => {
  return (
    <>
      <PageTitle value="Home" />
      <Typography variant="h5">
        Welcome to the new & fancy YCC app! ⛵🎉
      </Typography>
      <Typography padding={2}>
        Work is in progress... 🚧 Hopefully over time we get more and more
        features here! We really hope that your 📱 will like it too!
      </Typography>
      <Typography variant="h5">Interested in helping? Let us know!</Typography>
      <Typography padding={2}>
        We need helpers for various tasks, such as design (drawing on a piece of
        paper is perfect), testing (touching on a phone, clicking on a
        computer).
      </Typography>
      <Typography padding={2}>
        For nerds it is a lifetime opportunity to practice TypeScript, React,
        MUI, Python, FastAPI, SQLAlchemy, Keycloak, Java, Oracle DB, Openshift
        (... and whatever you would like, infra is ready to create standalone
        apps). We are on{' '}
        <Link
          href="https://github.com/Yachting-Club-CERN"
          target="_blank"
          rel="noopener"
        >
          GitHub
        </Link>
        !
      </Typography>
    </>
  );
};

export default Home;
