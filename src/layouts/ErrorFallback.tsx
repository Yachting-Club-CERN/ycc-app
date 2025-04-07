import SailingIcon from "@mui/icons-material/Sailing";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Link from "@mui/material/Link";
import { FallbackProps } from "react-error-boundary";

import ReadingBox from "@/components/layout/ReadingBox";
import SpacedTypography from "@/components/ui/SpacedTypography";
import getErrorText from "@/utils/error-helper";

const ErrorFallback: React.FC<FallbackProps> = (props) => {
  const error: unknown = props.error;
  const boatCount = Math.floor(Math.random() * 10) + 1;

  return (
    <ReadingBox>
      <Alert severity="error">
        <AlertTitle>Oops, something went terribly wrong :-(</AlertTitle>
        <SpacedTypography sx={{ whiteSpace: "pre-wrap" }}>
          {getErrorText(error)}
        </SpacedTypography>
        <SpacedTypography>
          No promise that{" "}
          <Link href="#" onClick={props.resetErrorBoundary}>
            reset
          </Link>{" "}
          will solve this issue, but worth a try...
        </SpacedTypography>
        <SpacedTypography>
          {Array.from({ length: boatCount }).map((_, i) => (
            <SailingIcon key={i} />
          ))}
        </SpacedTypography>
      </Alert>
    </ReadingBox>
  );
};

export default ErrorFallback;
