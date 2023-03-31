import Link from '@mui/material/Link';
import React from 'react';

import PageTitle from '@app/components/PageTitle';
import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
import SpacedTypopgraphy from '@app/components/SpacedTypography';
import {externalUrls} from '@app/layouts/ExternalUrls';

const Home = () => {
  return (
    <ReadingFriendlyBox>
      <>
        <PageTitle value="Welcome to the new & fancy YCC app! 🎉" />
        <SpacedTypopgraphy>
          Work is in progress... 🚧 Hopefully over time we get more and more
          features here! We really hope that your 📱 will like it too! In the
          meantime, ⛵ life is as usual.
        </SpacedTypopgraphy>
        <SpacedTypopgraphy variant="h3">
          Interested in helping? Let us know!
        </SpacedTypopgraphy>
        <SpacedTypopgraphy>
          We need Helpers for various tasks, such as design (drawing on a piece
          of paper is perfect), testing (touching on a phone, clicking on a
          computer).
        </SpacedTypopgraphy>
        <SpacedTypopgraphy>
          For nerds it is a lifetime opportunity to practice or simply get into
          TypeScript, React, MUI, Python, FastAPI, SQLAlchemy, Keycloak, Java,
          Oracle DB, Openshift (... of course no need for all the same time ...
          and whatever you would like, infra is ready to create standalone
          apps). We are on{' '}
          <Link href={externalUrls.yccGithub} target="_blank" rel="noopener">
            GitHub
          </Link>
          !
        </SpacedTypopgraphy>
      </>
    </ReadingFriendlyBox>
  );
};

export default Home;
