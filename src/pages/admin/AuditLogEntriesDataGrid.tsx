import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";

import useAuditLogEntryDialog from "@/components/dialogs/AuditLogEntryDialog/useAuditLogEntryDialog";
import { AuditLogEntry } from "@/model/audit-log-dtos";
import { DATA_GRID_PAGE_SIZE_OPTIONS } from "@/utils/constants";
import { formatDateTimeWithSeconds } from "@/utils/date-utils";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    minWidth: 180,
    valueFormatter: (value) => formatDateTimeWithSeconds(value),
  },
  {
    field: "application",
    headerName: "Application",
    minWidth: 140,
  },
  {
    field: "principal",
    headerName: "Principal",
    minWidth: 120,
  },
  {
    field: "description",
    headerName: "Description",
    flex: 1,
    width: 200,
  },
];

type Props = {
  entries: Readonly<AuditLogEntry[]>;
};

const AuditLogEntriesDataGrid: React.FC<Props> = ({ entries }) => {
  const auditLogEntryDialog = useAuditLogEntryDialog();

  const getRowId = (entry: AuditLogEntry): number => entry.id;
  const handleGridCellClick = (params: GridCellParams<AuditLogEntry>): void =>
    auditLogEntryDialog.open({ entry: params.row });

  return (
    <>
      <DataGrid
        columns={columns}
        rows={entries}
        getRowId={getRowId}
        onCellClick={handleGridCellClick}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        density="compact"
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
        sx={{
          // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
          minHeight: "215px",
          height: "calc(100vh - 155px)",
        }}
        className="ycc-audit-log-data-grid"
      />

      {auditLogEntryDialog.component}
    </>
  );
};

export default AuditLogEntriesDataGrid;
