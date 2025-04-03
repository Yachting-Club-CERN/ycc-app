import Link from "@mui/material/Link";

import ReadingFriendlyBox from "@/components/layout/ReadingFriendlyBox";
import PageTitle from "@/components/ui/PageTitle";
import SpacedTypography from "@/components/ui/SpacedTypography";
import { externalUrls } from "@/layouts/ExternalUrls";

const Home = () => {
  return (
    <ReadingFriendlyBox>
      <>
        <PageTitle value="Welcome to the new & fancy YCC App! 🎉" />
        <SpacedTypography>
          Work is in progress... 🚧 Hopefully over time we get more and more
          features here! We really hope that your 📱 will like it too! In the
          meantime, ⛵ life is as usual.
        </SpacedTypography>
        <SpacedTypography variant="h3">
          Interested in YCC App Development? Let us know!
        </SpacedTypography>
        <SpacedTypography>
          We need Helpers for various tasks, such as design (drawing on a piece
          of paper is perfect), testing (touching on a phone, clicking on a
          computer) - no computer experience needed!
        </SpacedTypography>
        <SpacedTypography>
          For nerds it is a lifetime opportunity to practise or simply get into
          TypeScript, React, MUI, Python, FastAPI, SQLAlchemy, Keycloak, OKD,
          Java, Oracle DB (... of course no need for all the same time ... and
          whatever you would like, infra is ready to create standalone apps). We
          are on{" "}
          <Link href={externalUrls.yccGithub} target="_blank" rel="noopener">
            GitHub
          </Link>
          !
        </SpacedTypography>
      </>
    </ReadingFriendlyBox>
  );
};

export default Home;
