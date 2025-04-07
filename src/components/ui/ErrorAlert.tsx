import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import getErrorText from "@/utils/error-helper";

import SpacedTypography from "./SpacedTypography";

type Props = {
  error: unknown;
  fatal?: boolean;
};

const ErrorAlert: React.FC<Props> = ({ error, fatal }) => {
  return (
    <Alert severity="error">
      <AlertTitle>
        {fatal
          ? "Oops, something went terribly wrong :-("
          : "Oops, something went wrong..."}
      </AlertTitle>
      <SpacedTypography sx={{ whiteSpace: "pre-wrap" }}>
        {getErrorText(error)}
      </SpacedTypography>
    </Alert>
  );
};

export default ErrorAlert;
