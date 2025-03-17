import { useEffect } from "react";

import PageTitle from "@/components/PageTitle";
import ReadingFriendlyBox from "@/components/ReadingFriendlyBox";
import SpacedTypography from "@/components/SpacedTypography";

const PlaygroundErrorPage = () => {
  useEffect(() => {
    throw new Error("This is an error...", {
      cause: "... and this is the cause",
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
