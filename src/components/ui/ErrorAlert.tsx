import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Typography from "@mui/material/Typography";

import getErrorText from "@/utils/error-helper";

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
      <Typography fontFamily="Roboto Mono, monospace" whiteSpace="pre-wrap">
        {getErrorText(error)}
      </Typography>
    </Alert>
  );
};

export default ErrorAlert;
