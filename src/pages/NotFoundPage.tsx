import { useLocation } from "react-router-dom";

import PageTitle from "@/components/PageTitle";
import ReadingFriendlyBox from "@/components/ReadingFriendlyBox";
import SpacedTypography from "@/components/SpacedTypography";
import toJson from "@/utils/toJson";

const NotFoundPage = () => {
  const location = useLocation();

  const debug = {
    problem: "Page not found",
    windowLocation: window.location.href,
    routerLocation: location,
  };
  console.debug("Debug info: ", debug);

  return (
    <ReadingFriendlyBox>
      <PageTitle value="Page Not Found" />
      <SpacedTypography>
        The page you are looking for does not seem to exist. No worries though,
        our boats are definitely found in Versoix (at least during the season).
        😉🌊⛵🎉
      </SpacedTypography>
      <SpacedTypography>
        If you feel the boogie you can send this to the IT Helpers:
      </SpacedTypography>
      <SpacedTypography sx={{ whiteSpace: "pre-wrap" }}>
        {toJson(debug)}
      </SpacedTypography>
    </ReadingFriendlyBox>
  );
};

export default NotFoundPage;
