import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";

import useMemberInfoDialog from "@/components/dialogs/MemberInfoDialog/useMemberInfoDialog";
import {
  renderEmail,
  renderPhoneNumber,
} from "@/components/ui/DataGrid/render-utils";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useCurrentUser from "@/context/auth/useCurrentUser";
import useMembers from "@/context/shared-data/useMembers";
import { MemberPublicInfo } from "@/model/dtos";
import { DATA_GRID_PAGE_SIZE_OPTIONS } from "@/utils/constants";
import {
  searchAnyStringProperty,
  searchMemberUsernameOrName,
} from "@/utils/search-utils";

const columns: GridColDef[] = [
  {
    field: "lastName",
    headerName: "Last Name",
    flex: 1,
    minWidth: 150,
    valueFormatter: (value: string) => value.toUpperCase(),
  },
  {
    field: "firstName",
    headerName: "First Name",
    flex: 1,
    minWidth: 100,
  },
  {
    field: "email",
    headerName: "Email",
    flex: 2,
    renderCell: renderEmail,
    minWidth: 250,
  },
  {
    field: "mobilePhone",
    headerName: "Mobile Phone",
    flex: 1,
    renderCell: renderPhoneNumber,
    minWidth: 120,
  },
  {
    field: "homePhone",
    headerName: "Home Phone",
    flex: 1,
    renderCell: renderPhoneNumber,
    minWidth: 120,
  },
  {
    field: "workPhone",
    headerName: "Work Phone",
    flex: 1,
    renderCell: renderPhoneNumber,
    minWidth: 120,
  },
  {
    field: "username",
    headerName: "Username",
    flex: 1,
    minWidth: 100,
  },
];

type Props = {
  year: number;
  search: string;
};

const idColumn: GridColDef = {
  field: "id",
  headerName: "ID",
  width: 70,
};

const MembersDataGrid = ({ year, search }: Props): React.ReactNode => {
  const currentUser = useCurrentUser();
  const members = useMembers(year);
  const visibleColumns = currentUser.helpersAppAdmin
    ? [...columns, idColumn]
    : columns;

  const memberInfoDialog = useMemberInfoDialog();

  const getRowId = (member: MemberPublicInfo): number => member.id;
  const handleGridCellClick = (
    params: GridCellParams<MemberPublicInfo>,
  ): void => {
    memberInfoDialog.open({ member: params.row });
  };

  const filter = (
    search: string,
    members: readonly MemberPublicInfo[],
  ): readonly MemberPublicInfo[] => {
    // User typically wants to search for one thing, e.g., name or phone number
    const s = search.toLowerCase().trim();
    if (s && members.length > 0) {
      return members.filter(
        (member) =>
          searchMemberUsernameOrName(s, member) ||
          searchAnyStringProperty(s, member),
      );
    } else {
      return members;
    }
  };

  return (
    <>
      {members.result && (
        <DataGrid
          columns={visibleColumns}
          rows={filter(search, members.result)}
          getRowId={getRowId}
          onCellClick={handleGridCellClick}
          disableColumnFilter
          pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
          sx={{
            // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
            minHeight: "215px",
            height: "calc(100vh - 155px)",
          }}
          className="ycc-members-data-grid"
        />
      )}

      <PromiseStatus outcomes={[members]} />

      {memberInfoDialog.component}
    </>
  );
};

export default MembersDataGrid;
