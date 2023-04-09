import {Box, Button, Link, Typography} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import {DataGrid, GridCellParams, GridColDef} from '@mui/x-data-grid';
import {MemberPublicInfo, MemberPublicInfos} from 'model/dtos';
import {HelperTask, HelperTaskHelper} from 'model/helpers-dtos';
import React, {SyntheticEvent, useContext, useState} from 'react';

import ErrorAlert from '@app/components/ErrorAlert';
import MemberInfoDialog from '@app/components/MemberInfoDialog';
import AuthenticationContext from '@app/context/AuthenticationContext';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';
import {
  formatDate,
  formatDateTime,
  formatDateWithDay,
  formatTime,
} from '@app/utils/date-utils';

// TODO Separate page to show detailed view -> preferably by ID in URL
// TODO Do not display all columns on mobile
// TODO Confirmation page before sign up
// TODO A member can only participate in once in one task! This should be checked by the backend, but also by the frontend
// TODO "Random" generator should be maybe deterministic, so on refresh the same texts are displayed (e.g., for each task it's by task id)

const HelperTasksDataGrid = () => {
  const {result: tasks, error, pending} = usePromise(client.getHelperTasks);
  const [memberInfoDialogContent, setMemberInfoDialogContent] =
    useState<MemberPublicInfo | null>(null);
  const currentUser = useContext(AuthenticationContext).currentUser;

  const getRowId = (task: HelperTask) => task.id;
  const handleGridClick = (params: GridCellParams) => {
    // params.colDef.field === 'contact'
    alert('Clicked! ' + params.row);
  };

  const openMemberInfoDialog = (
    e: SyntheticEvent,
    memberInfo: MemberPublicInfo
  ) => {
    e.stopPropagation();
    setMemberInfoDialogContent(memberInfo);
  };
  const createTimingCellText = (task: HelperTask) => {
    if (task.deadline && !task.start && !task.end) {
      return (
        <>
          <Box sx={{color: 'warning.main', fontWeight: 'bold'}}>Deadline</Box>
          <Box>{formatDateWithDay(task.deadline)}</Box>
          <Box>{formatTime(task.deadline)}</Box>
        </>
      );
    } else if (task.start && task.end) {
      const sameDayEnd =
        new Date(task.start).getDate() === new Date(task.end).getDate();
      if (sameDayEnd) {
        return (
          <>
            <Box sx={{color: 'info.main', fontWeight: 'bold'}}>Shift</Box>
            <Box>{formatDateWithDay(task.start)}</Box>
            <Box>
              {formatTime(task.start)} -- {formatTime(task.end)}
            </Box>
          </>
        );
      } else {
        // Note: this we did not have at all before 2023, not sure whether it would be used
        return (
          <>
            <Box sx={{color: 'info.main', fontWeight: 'bold'}}>
              Multi-day shift
            </Box>
            <Box>Start: {formatDateTime(task.start)}</Box>
            <Box>End: {formatDateTime(task.end)}</Box>
          </>
        );
      }
    } else {
      // Fallback for inconsistent data
      return (
        <>
          <Box>Start: {task.start ?? '-'}</Box>
          <Box>End: {task.end ?? '-'}</Box>
          <Box> Deadline: {task.deadline ?? '-'}</Box>
        </>
      );
    }
  };

  const renderTimingCell = (params: GridCellParams) => {
    const task = params.row as HelperTask;
    return (
      <Typography align="center" variant="body2">
        {createTimingCellText(task)}
      </Typography>
    );
  };

  const createMemberDialogLink = (member: MemberPublicInfo) => {
    return (
      <Link onClick={e => openMemberInfoDialog(e, member)}>
        {member.username}
      </Link>
    );
  };

  const renderContactCell = (params: GridCellParams) => {
    const task = params.row as HelperTask;

    return (
      <Typography align="center" variant="body2">
        {createMemberDialogLink(task.contact)}
      </Typography>
    );
  };

  const renderCaptainCell = (params: GridCellParams) => {
    const task = params.row as HelperTask;

    if (task.captain) {
      return (
        <Typography align="center" variant="body2">
          {createMemberDialogLink(task.captain.member)}
        </Typography>
      );
    } else {
      if (
        !task.captainRequiredLicence ||
        (task.captainRequiredLicence &&
          currentUser.hasLicence(task.captainRequiredLicence))
      ) {
        const texts = [
          'Sign me up!',
          'I am in!',
          'I will help!',
          'I will do it!',
        ];

        return (
          <Typography align="center" variant="body2">
            <Button>{texts[Math.floor(Math.random() * texts.length)]}</Button>
          </Typography>
        );
      } else {
        return <Typography align="center" variant="body2"></Typography>;
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Timing',
      align: 'center',
      width: 200,
      renderCell: renderTimingCell,
    },
    {field: 'title', headerName: 'Title', width: 120},
    {field: 'shortDescription', headerName: 'Short Description', minWidth: 250},
    {
      field: 'contact',
      headerName: 'Contact',
      width: 120,
      renderCell: renderContactCell,
    },
    // {field: 'urgent', headerName: 'Urgent', width: 100, type: 'boolean'},
    // {
    //   field: 'captain_required_licence',
    //   headerName: 'Captain Required Licence',
    //   width: 200,
    // },
    // {
    //   field: 'helpers_min_count',
    //   headerName: 'Min. Helpers',
    //   width: 150,
    //   type: 'number',
    // },
    // {
    //   field: 'helpers_max_count',
    //   headerName: 'Max. Helpers',
    //   width: 150,
    //   type: 'number',
    // },
    {
      field: 'captain',
      headerName: 'Captain',
      width: 120,
      renderCell: renderCaptainCell,
    },
    {
      field: 'helpers',
      headerName: 'Helpers',
      width: 120,
      valueGetter: params =>
        params.row.helpers
          .map(
            (h: HelperTaskHelper) =>
              `${h.member.firstName} ${h.member.lastName}`
          )
          .join(', '),
    },
  ];

  return (
    <>
      {tasks && (
        <DataGrid
          columns={columns}
          rows={tasks}
          getRowId={getRowId}
          onCellClick={handleGridClick}
          disableColumnFilter={true}
          rowsPerPageOptions={[10, 25, 50, 100]}
          rowHeight={78}
          sx={{
            // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
            minHeight: '215px',
            height: 'calc(100vh - 260px)',
          }}
        />
      )}
      {error && <ErrorAlert error={error} />}
      {pending && <CircularProgress />}

      <MemberInfoDialog
        selected={memberInfoDialogContent}
        handleClose={() => setMemberInfoDialogContent(null)}
      />
    </>
  );
};

export default HelperTasksDataGrid;
