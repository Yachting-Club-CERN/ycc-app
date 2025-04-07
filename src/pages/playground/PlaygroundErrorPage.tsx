import { useEffect } from "react";

import ReadingBox from "@/components/layout/ReadingBox";
import PageTitle from "@/components/ui/PageTitle";
import SpacedTypography from "@/components/ui/SpacedTypography";

const PlaygroundErrorPage: React.FC = () => {
  useEffect(() => {
    throw new Error("This is an error...", {
      cause: "... and this is the cause",
    });
  }, []);

  return (
    <ReadingBox>
      <PageTitle value="Playground: Error" />
      <SpacedTypography>Wait for it...</SpacedTypography>
    </ReadingBox>
  );
};

export default PlaygroundErrorPage;
