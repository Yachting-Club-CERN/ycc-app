import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";

import PromiseStatus from "@/components/PromiseStatus";
import useMemberInfoDialog from "@/hooks/useMemberInfoDialog";
import usePromise from "@/hooks/usePromise";
import { HelpersAppPermission } from "@/model/helpers-dtos";
import client from "@/utils/client";

const columns: GridColDef[] = [
  {
    field: "member.id",
    headerName: "ID",
    width: 70,
    valueGetter: (_, permission: HelpersAppPermission) => permission.member.id,
  },
  {
    field: "member.lastName",
    headerName: "Last name",
    flex: 1,
    minWidth: 150,
    valueGetter: (_, permission: HelpersAppPermission) =>
      permission.member.lastName.toUpperCase(),
  },
  {
    field: "member.firstName",
    headerName: "First Name",
    flex: 1,
    minWidth: 100,
    valueGetter: (_, permission: HelpersAppPermission) =>
      permission.member.firstName,
  },
  {
    field: "member.username",
    headerName: "Username",
    flex: 1,
    minWidth: 100,
    valueGetter: (_, permission: HelpersAppPermission) =>
      permission.member.username.toUpperCase(),
  },
  {
    field: "permission",
    headerName: "Permission",
    width: 100,
  },
  {
    field: "note",
    headerName: "Note",
    flex: 2,
  },
];

const PermissionsDataGrid = () => {
  const permissions = usePromise((signal?: AbortSignal) =>
    client.getHelpersAppPermissions(signal),
  );
  const { memberInfoDialogComponent, openMemberInfoDialog } =
    useMemberInfoDialog();

  const getRowId = (permission: HelpersAppPermission) =>
    permission.member.username;
  const handleGridClick = (params: GridCellParams<HelpersAppPermission>) => {
    openMemberInfoDialog({
      member: params.row.member,
      extra: {
        Permission: params.row.permission,
        Note: params.row.note ?? "-",
      },
    });
  };

  return (
    <>
      {permissions.result && (
        <DataGrid
          columns={columns}
          rows={permissions.result}
          getRowId={getRowId}
          onCellClick={handleGridClick}
          disableColumnFilter={true}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
            minHeight: "215px",
            height: "calc(100vh - 270px)",
          }}
          className="ycc-permissions-data-grid"
        />
      )}

      <PromiseStatus outcomes={[permissions]} />

      {memberInfoDialogComponent}
    </>
  );
};

export default PermissionsDataGrid;
