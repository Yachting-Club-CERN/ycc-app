import {DataGrid, GridCellParams, GridColDef} from '@mui/x-data-grid';
import {MemberPublicInfo, MemberPublicInfos} from 'model/dtos';
import React, {useContext} from 'react';

import PromiseStatus from '@app/components/PromiseStatus';
import {toEmailLink, toTelLink} from '@app/components/links';
import SharedDataContext from '@app/context/SharedDataContext';
import useMemberInfoDialog from '@app/hooks/useMemberInfoDialog';
import usePromise from '@app/hooks/usePromise';
import {
  searchAnyStringProperty,
  searchMemberUsernameOrName,
} from '@app/utils/search-utils';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const renderEmail = (params: GridCellParams<any, string | null>) => {
  return toEmailLink(params.value);
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const renderPhoneNumber = (params: GridCellParams<any, string | null>) => {
  return toTelLink(params.value);
};

const columns: GridColDef[] = [
  {
    field: 'lastName',
    headerName: 'Last name',
    flex: 1,
    minWidth: 150,
    valueFormatter: params => (params.value as string).toUpperCase(),
  },
  {
    field: 'firstName',
    headerName: 'First Name',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 2,
    renderCell: renderEmail,
    minWidth: 250,
  },
  {
    field: 'mobilePhone',
    headerName: 'Mobile Phone',
    flex: 1,
    renderCell: renderPhoneNumber,
    minWidth: 120,
  },
  {
    field: 'homePhone',
    headerName: 'Home Phone',
    flex: 1,
    renderCell: renderPhoneNumber,
    minWidth: 120,
  },
  {
    field: 'workPhone',
    headerName: 'Work Phone',
    flex: 1,
    renderCell: renderPhoneNumber,
    minWidth: 120,
  },
  {
    field: 'username',
    headerName: 'Username',
    flex: 1,
    minWidth: 100,
  },
];

type Props = {
  year: number;
  search: string;
};

const MembersDataGrid = ({year, search}: Props) => {
  const sharedData = useContext(SharedDataContext);
  const getMembersForYear = (signal?: AbortSignal) =>
    sharedData.getMembers(year, signal);
  const members = usePromise(getMembersForYear);
  const {memberInfoDialogComponent, openMemberInfoDialog} =
    useMemberInfoDialog();

  const getRowId = (member: MemberPublicInfo) => member.username;
  const handleGridClick = (params: GridCellParams) => {
    openMemberInfoDialog(params.row as MemberPublicInfo);
  };

  const filter = (search: string, members: MemberPublicInfos) => {
    // User typically wants to search for one thing, e.g., name or phone number
    const s = search.toLowerCase().trim();
    if (s && members) {
      return members.filter(
        member =>
          searchMemberUsernameOrName(s, member) ||
          searchAnyStringProperty(s, member)
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
          onCellClick={handleGridClick}
          disableColumnFilter={true}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
            minHeight: '215px',
            height: 'calc(100vh - 270px)',
          }}
          className="ycc-members-data-grid"
        />
      )}

      <PromiseStatus outcomes={[members]} />

      {memberInfoDialogComponent}
    </>
  );
};

export default MembersDataGrid;
