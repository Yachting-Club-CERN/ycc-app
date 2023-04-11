import CircularProgress from '@mui/material/CircularProgress';
import {DataGrid, GridCellParams, GridColDef} from '@mui/x-data-grid';
import {MemberPublicInfo, MemberPublicInfos} from 'model/dtos';
import React from 'react';

import ErrorAlert from '@app/components/ErrorAlert';
import {toEmailLink, toTelLink} from '@app/components/links';
import useMemberInfoDialog from '@app/hooks/useMemberInfoDialog';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';

const renderEmail = (params: GridCellParams<string | null>) => {
  return toEmailLink(params.value);
};

const renderPhoneNumber = (params: GridCellParams<string | null>) => {
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
  const getMembersForYear = (signal?: AbortSignal) =>
    client.getMembers(year, signal);
  const {result: members, error, pending} = usePromise(getMembersForYear);
  const {memberInfoDialogComponent, openMemberInfoDialog} =
    useMemberInfoDialog();

  const getRowId = (member: MemberPublicInfo) => member.username;
  const handleGridClick = (params: GridCellParams) => {
    openMemberInfoDialog(params.row as MemberPublicInfo);
  };

  const filter = (search: string, members: MemberPublicInfos) => {
    if (search && members) {
      const s = search.toLowerCase();
      return members.filter(member =>
        Object.values(member).some(
          value => typeof value === 'string' && value.toLowerCase().includes(s)
        )
      );
    } else {
      return members;
    }
  };

  return (
    <>
      {members && (
        <DataGrid
          columns={columns}
          rows={filter(search, members)}
          getRowId={getRowId}
          onCellClick={handleGridClick}
          disableColumnFilter={true}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
            minHeight: '215px',
            height: 'calc(100vh - 270px)',
          }}
        />
      )}
      {error && <ErrorAlert error={error} />}
      {pending && <CircularProgress />}

      {memberInfoDialogComponent}
    </>
  );
};

export default MembersDataGrid;
