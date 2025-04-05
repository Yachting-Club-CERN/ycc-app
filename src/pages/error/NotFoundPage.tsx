import { useLocation } from "react-router-dom";

import ReadingBox from "@/components/layout/ReadingBox";
import PageTitle from "@/components/ui/PageTitle";
import SpacedTypography from "@/components/ui/SpacedTypography";
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
    <ReadingBox>
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
    </ReadingBox>
  );
};

export default NotFoundPage;
