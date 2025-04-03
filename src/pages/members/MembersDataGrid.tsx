import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";

import EmailLink from "@/components/ui/links/EmailLink";
import PhoneLink from "@/components/ui/links/PhoneLink";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useMemberInfoDialog from "@/hooks/dialogs/useMemberInfoDialog";
import useMembers from "@/hooks/shared-data/useMembers";
import { MemberPublicInfo, MemberPublicInfos } from "@/model/dtos";
import {
  searchAnyStringProperty,
  searchMemberUsernameOrName,
} from "@/utils/search-utils";

const renderEmail = (
  params: GridRenderCellParams<MemberPublicInfo, string | null>,
) => {
  return <EmailLink email={params.value} />;
};

const renderPhoneNumber = (
  params: GridRenderCellParams<MemberPublicInfo, string | null>,
) => {
  return <PhoneLink phone={params.value} />;
};

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
  },
  {
    field: "lastName",
    headerName: "Last name",
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

const MembersDataGrid = ({ year, search }: Props) => {
  const members = useMembers(year);

  const memberInfoDialog = useMemberInfoDialog();

  const getRowId = (member: MemberPublicInfo) => member.username;
  const handleGridCellClick = (params: GridCellParams<MemberPublicInfo>) =>
    memberInfoDialog.open({ member: params.row });

  const filter = (search: string, members: MemberPublicInfos) => {
    // User typically wants to search for one thing, e.g., name or phone number
    const s = search.toLowerCase().trim();
    if (s && members) {
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
          columns={columns}
          rows={filter(search, members.result)}
          getRowId={getRowId}
          onCellClick={handleGridCellClick}
          disableColumnFilter={true}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          sx={{
            // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
            minHeight: "215px",
            height: "calc(100vh - 270px)",
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
