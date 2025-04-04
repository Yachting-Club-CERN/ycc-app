import { useEffect } from "react";

import ReadingFriendlyBox from "@/components/layout/ReadingFriendlyBox";
import PageTitle from "@/components/ui/PageTitle";
import SpacedTypography from "@/components/ui/SpacedTypography";

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
