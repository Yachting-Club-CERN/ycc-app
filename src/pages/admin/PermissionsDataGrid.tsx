import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";

import useMemberInfoDialog from "@/components/dialogs/MemberInfoDialog/useMemberInfoDialog";
import { HelpersAppPermission } from "@/model/helpers-dtos";

const columns: GridColDef[] = [
  {
    field: "member.id",
    headerName: "ID",
    width: 70,
    valueGetter: (_, permission: HelpersAppPermission) => permission.member.id,
  },
  {
    field: "member.lastName",
    headerName: "Last Name",
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
      permission.member.username,
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

type Props = {
  permissions: HelpersAppPermission[];
};

const PermissionsDataGrid = ({ permissions }: Props) => {
  const memberInfoDialog = useMemberInfoDialog();

  const getRowId = (permission: HelpersAppPermission) =>
    permission.member.username;
  const handleGridCellClick = (
    params: GridCellParams<HelpersAppPermission>,
  ) => {
    memberInfoDialog.open({
      member: params.row.member,
      extra: {
        Permission: params.row.permission,
        Note: params.row.note ?? "-",
      },
    });
  };

  return (
    <>
      <DataGrid
        columns={columns}
        rows={permissions}
        getRowId={getRowId}
        onCellClick={handleGridCellClick}
        disableColumnFilter={true}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
          minHeight: "215px",
          height: "calc(100vh - 270px)",
        }}
        className="ycc-permissions-data-grid"
      />

      {memberInfoDialog.component}
    </>
  );
};

export default PermissionsDataGrid;
