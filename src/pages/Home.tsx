import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';

import PageTitle from '@app/components/PageTitle';
import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
import ExternalUrls from '@app/layouts/ExternalUrls';

const Home = () => {
  return (
    <ReadingFriendlyBox>
      <>
        <PageTitle value="Welcome to the new & fancy YCC app! 🎉" />
        <Typography>
          Work is in progress... 🚧 Hopefully over time we get more and more
          features here! We really hope that your 📱 will like it too! In the
          meantime, ⛵ life is as usual.
        </Typography>
        <Typography variant="h3">
          Interested in helping? Let us know!
        </Typography>
        <Typography>
          We need Helpers for various tasks, such as design (drawing on a piece
          of paper is perfect), testing (touching on a phone, clicking on a
          computer).
        </Typography>
        <Typography>
          For nerds it is a lifetime opportunity to practice or simply get into
          TypeScript, React, MUI, Python, FastAPI, SQLAlchemy, Keycloak, Java,
          Oracle DB, Openshift (... of course no need for all the same time ...
          and whatever you would like, infra is ready to create standalone
          apps). We are on{' '}
          <Link href={ExternalUrls.yccGithub} target="_blank" rel="noopener">
            GitHub
          </Link>
          !
        </Typography>
      </>
    </ReadingFriendlyBox>
  );
};

export default Home;
