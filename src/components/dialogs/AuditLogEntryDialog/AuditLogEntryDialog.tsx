import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import React from "react";

import PromiseStatus from "@/components/ui/PromiseStatus";
import usePromise from "@/hooks/usePromise";
import { AuditLogEntry } from "@/model/audit-log-dtos";
import client from "@/utils/client";
import { formatDateTimeWithSeconds } from "@/utils/date-utils";

import AuditLogEntryDataView from "./AuditLogEntryDataView";

type Props = {
  entry: AuditLogEntry | null;
  onClose: () => void;
};

const AuditLogEntryDialog: React.FC<Props> = ({ entry, onClose }) => {
  const entryWithData = usePromise(
    async (signal?: AbortSignal) =>
      entry ? await client.auditLog.getEntryById(entry.id, signal) : null,
    [entry],
  );

  return (
    <Dialog
      open={!!entry}
      onClose={onClose}
      maxWidth="xl"
      className="ycc-audit-log-entry-dialog"
    >
      {entry && (
        <>
          <DialogTitle>Audit Log Entry #{entry.id}</DialogTitle>
          <DialogContent sx={{ pb: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Created At:
            </Typography>
            <Typography gutterBottom>
              {formatDateTimeWithSeconds(entry.createdAt)}
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold">
              Application:
            </Typography>
            <Typography gutterBottom>{entry.application}</Typography>

            <Typography variant="subtitle1" fontWeight="bold">
              Principal:
            </Typography>
            <Typography gutterBottom>{entry.principal}</Typography>

            <Typography variant="subtitle1" fontWeight="bold">
              Description:
            </Typography>
            <Typography gutterBottom>{entry.description}</Typography>

            <Typography variant="subtitle1" fontWeight="bold">
              Data:
            </Typography>
            <AuditLogEntryDataView data={entryWithData.result?.data} />
            <PromiseStatus outcomes={[entryWithData]} />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default AuditLogEntryDialog;
