import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {lighten, styled} from '@mui/material/styles';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowParams,
  gridClasses,
} from '@mui/x-data-grid';
import {MemberPublicInfo} from 'model/dtos';
import {HelperTask, HelperTaskHelper, HelperTasks} from 'model/helpers-dtos';
import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import ErrorAlert from '@app/components/ErrorAlert';
import SpanBlockBox from '@app/components/SpanBlockBox';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useMemberInfoDialog from '@app/hooks/useMemberInfoDialog';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';

import {
  canSubscribe,
  canSubscribeAsCaptain,
  canSubscribeAsHelper,
  createTimingInfoFragment,
  fakeRandomSubscribeText,
  isSubscribed,
  isUpcomingTask,
} from './helpers-utils';

const StyledDataGrid = styled(DataGrid)(({theme}) => ({
  [`& .${gridClasses.row}.urgent`]: {
    backgroundColor: lighten(theme.palette.error.main, 0.85),
    '&:hover, &.Mui-hovered': {
      backgroundColor: lighten(theme.palette.error.main, 0.6),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
  },
})) as typeof DataGrid;

const HelperTasksDataGrid = () => {
  const {result: tasks, error, pending} = usePromise(client.getHelperTasks);
  const currentUser = useContext(AuthenticationContext).currentUser;
  const navigate = useNavigate();

  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);
  const [showOnlySubscribed, setShowOnlySubscribed] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const {memberInfoDialogComponent, openMemberInfoDialog} =
    useMemberInfoDialog();

  const getRowId = (task: HelperTask) => task.id;
  const filter = (tasks: HelperTasks) => {
    return tasks
      .filter(task => (showOnlyUpcoming ? isUpcomingTask(task) : true))
      .filter(task =>
        showOnlySubscribed ? isSubscribed(task, currentUser) : true
      )
      .filter(task =>
        showOnlyAvailable ? canSubscribe(task, currentUser) : true
      );
  };

  const handleCheckboxChange = (
    event: React.SyntheticEvent,
    setState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const {checked} = event.target as HTMLInputElement;
    setState(checked);
  };

  const navigateToTask = (id: number) => {
    navigate(`/helpers/tasks/${id}`);
  };
  const handleGridClick = (params: GridCellParams) => {
    navigateToTask(params.row.id);
  };

  const openMemberInfoDialogFromGrid = (
    event: React.SyntheticEvent,
    memberInfo: MemberPublicInfo
  ) => {
    event.stopPropagation();
    openMemberInfoDialog(memberInfo);
  };

  const createMemberDialogLink = (member: MemberPublicInfo) => {
    return (
      <Link
        sx={{color: 'grey', textDecorationColor: 'grey'}}
        onClick={event => openMemberInfoDialogFromGrid(event, member)}
      >
        {member.username}
      </Link>
    );
  };

  const renderTimingCell = (params: GridCellParams) => {
    const task = params.row as HelperTask;
    return (
      <Typography align="center" variant="body2">
        {createTimingInfoFragment(task)}
      </Typography>
    );
  };

  const renderTaskCell = (params: GridCellParams) => {
    const task = params.row as HelperTask;
    return (
      <Typography variant="body2">
        <SpanBlockBox>{task.title}</SpanBlockBox>
        <SpanBlockBox sx={{fontStyle: 'italic'}}>
          {task.category.title}
        </SpanBlockBox>
      </Typography>
    );
  };

  const renderContactCell = (params: GridCellParams) => {
    const task = params.row as HelperTask;

    return (
      <Typography variant="body2">
        {createMemberDialogLink(task.contact)}
      </Typography>
    );
  };

  const renderCaptainCell = (params: GridCellParams) => {
    const task = params.row as HelperTask;

    if (task.captain) {
      return (
        <Typography variant="body2">
          {createMemberDialogLink(task.captain.member)}
        </Typography>
      );
    } else if (canSubscribeAsCaptain(task, currentUser)) {
      return (
        <Typography variant="body2">
          <Link onClick={() => navigateToTask(task.id)}>
            {fakeRandomSubscribeText(task.id, true)}
          </Link>
        </Typography>
      );
    } else {
      return <Typography variant="body2"></Typography>;
    }
  };

  const renderHelpersCell = (params: GridCellParams) => {
    const task = params.row as HelperTask;

    return (
      <Typography variant="body2">
        {canSubscribeAsHelper(task, currentUser) && (
          <SpanBlockBox>
            <Link onClick={() => navigateToTask(task.id)}>
              {fakeRandomSubscribeText(task.id, false)}
            </Link>
          </SpanBlockBox>
        )}
        {[...task.helpers]
          .sort((lhs: HelperTaskHelper, rhs: HelperTaskHelper) =>
            lhs.member.username.localeCompare(rhs.member.username)
          )
          .map((h: HelperTaskHelper) => {
            return (
              <SpanBlockBox key={h.member.username}>
                {createMemberDialogLink(h.member)}
              </SpanBlockBox>
            );
          })}
      </Typography>
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Timing',
      align: 'center',
      width: 200,
      renderCell: renderTimingCell,
    },
    {
      field: 'title',
      headerName: 'Task',
      width: 200,
      renderCell: renderTaskCell,
    },
    {
      field: 'shortDescription',
      headerName: 'Short Description',
      minWidth: 300,
      flex: 1,
    },
    {
      field: 'contact',
      headerName: 'Contact',
      width: 120,
      renderCell: renderContactCell,
    },
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
      renderCell: renderHelpersCell,
    },
  ];

  return (
    <>
      {tasks && (
        <>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOnlyUpcoming}
                  onChange={event =>
                    handleCheckboxChange(event, setShowOnlyUpcoming)
                  }
                />
              }
              label="Only show upcoming tasks"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOnlySubscribed}
                  onChange={event =>
                    handleCheckboxChange(event, setShowOnlySubscribed)
                  }
                />
              }
              label="Only show my tasks"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOnlyAvailable}
                  onChange={event =>
                    handleCheckboxChange(event, setShowOnlyAvailable)
                  }
                />
              }
              label="Only show tasks where I can subscribe"
            />
          </Box>
          <StyledDataGrid
            columns={columns}
            rows={filter(tasks)}
            getRowId={getRowId}
            onCellClick={handleGridClick}
            disableColumnFilter={true}
            rowsPerPageOptions={[10, 25, 50, 100]}
            // getRowStyle={getRowStyle}
            getRowClassName={(params: GridRowParams) =>
              (params.row as HelperTask).urgent ? 'urgent' : ''
            }
            rowHeight={78}
            sx={{
              // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
              minHeight: '215px',
              height: 'calc(100vh - 260px)',
            }}
          />
        </>
      )}
      {error && <ErrorAlert error={error} />}
      {pending && <CircularProgress />}

      {memberInfoDialogComponent}
    </>
  );
};

export default HelperTasksDataGrid;
