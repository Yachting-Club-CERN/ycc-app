import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
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

import PromiseStatus from '@app/components/PromiseStatus';
import SpanBlockBox from '@app/components/SpanBlockBox';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useMemberInfoDialog from '@app/hooks/useMemberInfoDialog';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';

import {
  canSignUp,
  canSignUpAsCaptain,
  canSignUpAsHelper,
  createTimingInfoFragment,
  fakeRandomSignUpText,
  isContact,
  isSignedUp,
  isUpcoming,
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
  const tasks = usePromise(client.getHelperTasks);
  const currentUser = useContext(AuthenticationContext).currentUser;
  const navigate = useNavigate();

  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);
  const [showOnlyContactOrSignedUp, setShowOnlyContactOrSignedUp] =
    useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showOnlyUnpublished, setShowOnlyUnpublished] = useState(false);
  const {memberInfoDialogComponent, openMemberInfoDialog} =
    useMemberInfoDialog();

  const getRowId = (task: HelperTask) => task.id;
  const filter = (tasks: HelperTasks) => {
    return tasks
      .filter(task => (showOnlyUpcoming ? isUpcoming(task) : true))
      .filter(task =>
        showOnlyContactOrSignedUp
          ? isContact(task, currentUser) || isSignedUp(task, currentUser)
          : true
      )
      .filter(task => (showOnlyAvailable ? canSignUp(task, currentUser) : true))
      .filter(task => (showOnlyUnpublished ? !task.published : true));
  };

  const handleCheckboxChange = (
    event: React.SyntheticEvent,
    handler: (checked: boolean) => void
  ) => {
    const {checked} = event.target as HTMLInputElement;
    handler(checked);
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
    } else if (canSignUpAsCaptain(task, currentUser)) {
      return (
        <Typography variant="body2">
          <Link onClick={() => navigateToTask(task.id)}>
            {fakeRandomSignUpText(task.id, true)}
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
        {canSignUpAsHelper(task, currentUser) && (
          <SpanBlockBox>
            <Link onClick={() => navigateToTask(task.id)}>
              {fakeRandomSignUpText(task.id, false)}
            </Link>
          </SpanBlockBox>
        )}
        {[...task.helpers]
          .sort((lhs: HelperTaskHelper, rhs: HelperTaskHelper) =>
            lhs.member.username.localeCompare(rhs.member.username)
          )
          .map((helper: HelperTaskHelper) => {
            return (
              <SpanBlockBox key={helper.member.username}>
                {createMemberDialogLink(helper.member)}
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
      sortable: false,
    },
    {
      field: 'title',
      headerName: 'Task',
      width: 200,
      renderCell: renderTaskCell,
      sortable: false,
    },
    {
      field: 'shortDescription',
      headerName: 'Short Description',
      minWidth: 300,
      flex: 1,
      sortable: false,
    },
    {
      field: 'contact',
      headerName: 'Contact',
      width: 120,
      renderCell: renderContactCell,
      sortable: false,
    },
    {
      field: 'captain',
      headerName: 'Captain',
      width: 120,
      renderCell: renderCaptainCell,
      sortable: false,
    },
    {
      field: 'helpers',
      headerName: 'Helpers',
      width: 120,
      renderCell: renderHelpersCell,
      sortable: false,
    },
  ];

  return (
    <>
      {tasks.result && (
        <>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOnlyUpcoming}
                  onChange={event =>
                    handleCheckboxChange(event, checked =>
                      setShowOnlyUpcoming(checked)
                    )
                  }
                />
              }
              label="Only upcoming"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOnlyContactOrSignedUp}
                  onChange={event =>
                    handleCheckboxChange(event, checked => {
                      setShowOnlyContactOrSignedUp(checked);
                      if (checked) {
                        setShowOnlyAvailable(false);
                      }
                    })
                  }
                />
              }
              label="Only mine"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOnlyAvailable}
                  onChange={event =>
                    handleCheckboxChange(event, checked => {
                      setShowOnlyAvailable(checked);
                      if (checked) {
                        setShowOnlyContactOrSignedUp(false);
                      }
                    })
                  }
                />
              }
              label="Only available"
            />
            {currentUser.helpersAppAdminOrEditor && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOnlyUnpublished}
                    onChange={event =>
                      handleCheckboxChange(event, checked =>
                        setShowOnlyUnpublished(checked)
                      )
                    }
                  />
                }
                label="Only unpublished"
              />
            )}
          </Box>
          <StyledDataGrid
            columns={columns}
            rows={filter(tasks.result)}
            getRowId={getRowId}
            onCellClick={handleGridClick}
            disableColumnFilter={true}
            rowsPerPageOptions={[10, 25, 50, 100]}
            getRowClassName={(params: GridRowParams) =>
              (params.row as HelperTask).urgent ? 'urgent' : ''
            }
            rowHeight={78}
            sx={{
              // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
              minHeight: '265px',
              height: 'calc(100vh - 340px)',
            }}
          />
        </>
      )}

      <PromiseStatus outcomes={[tasks]} />

      {memberInfoDialogComponent}
    </>
  );
};

export default HelperTasksDataGrid;
