import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { DatePicker } from "@mui/x-date-pickers";
import { useRef, useState } from "react";

import useConfirmationDialog from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import RowStack from "@/components/layout/RowStack";
import SpacedBox from "@/components/layout/SpacedBox";
import ErrorAlert from "@/components/ui/ErrorAlert";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { useNavigate } from "@/hooks/useNavigate";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";
import { getNow } from "@/utils/date-utils";
import dayjs from "@/utils/dayjs";

import AuditLogEntriesDataGrid from "./AuditLogEntriesDataGrid";

const AuditLogPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const deleteEntriesDialog = useConfirmationDialog();
  const [error, setError] = useState<unknown>();
  const [reloadFlag, setReloadFlag] = useState(0);
  const entries = usePromise(client.auditLog.getEntries, [reloadFlag]);
  const cutoffDate = useRef<dayjs.Dayjs>(
    getNow().subtract(90, "days").startOf("day"),
  );

  const navigate = useNavigate();
  if (!currentUser.helpersAppAdmin) {
    void navigate("/");
  }

  const handleClick = (): void => {
    deleteEntriesDialog.open({
      title: "Delete audit log entries",
      content: (
        <DatePicker
          label="Cutoff Date"
          onChange={(newValue) => {
            if (newValue) {
              cutoffDate.current = newValue;
            }
          }}
          value={cutoffDate.current}
          sx={{ mt: 1, mb: 2 }}
        />
      ),
      confirmButtonColor: "error",
      confirmButtonText: "Delete",
      cancelButtonColor: "primary",
      delayConfirm: true,
      onConfirm: async () => {
        setError(undefined);

        if (!cutoffDate.current.isValid()) {
          setError(
            new Error("Invalid date selected. Please select a valid date."),
          );
          return;
        }

        try {
          await client.auditLog.deleteEntries({
            cutoffDate: cutoffDate.current.format("YYYY-MM-DD"),
          });
          setReloadFlag((prev) => prev + 1);
        } catch (error) {
          setError(error);
        }
      },
    });
  };

  const pageTitle = entries.result
    ? `Audit Log (${entries.result.length})`
    : "Audit Log";

  return (
    <>
      <RowStack wrap={false} compact={true} mb={2}>
        <PageTitle value={pageTitle} />
        <IconButton color="error" onClick={handleClick}>
          <DeleteIcon />
        </IconButton>
      </RowStack>

      {error && (
        <SpacedBox>
          <ErrorAlert error={error} />
        </SpacedBox>
      )}

      {entries.result && <AuditLogEntriesDataGrid entries={entries.result} />}

      <PromiseStatus outcomes={[entries]} />
      {deleteEntriesDialog.component}
    </>
  );
};

export default AuditLogPage;
