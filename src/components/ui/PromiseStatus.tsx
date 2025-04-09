import CircularProgress from "@mui/material/CircularProgress";

import { PromiseOutcome } from "@/hooks/usePromise";

import ErrorAlert from "./ErrorAlert";

type Props = {
  outcomes: PromiseOutcome<unknown>[];
};

const PromiseStatus: React.FC<Props> = ({ outcomes }) => {
  const pending = outcomes.some((outcome) => outcome.pending);
  const error = outcomes.find((outcome) => outcome.error)?.error;

  return (
    <>
      {error && <ErrorAlert error={error} />}
      {pending && !error && <CircularProgress sx={{ mb: 2 }} />}
    </>
  );
};

export default PromiseStatus;
