import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {lighten, styled} from '@mui/material/styles';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowParams,
  MuiEvent,
  gridClasses,
} from '@mui/x-data-grid';
import {MemberPublicInfo} from 'model/dtos';
import {HelperTask, HelperTaskHelper, HelperTasks} from 'model/helpers-dtos';
import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';

import PromiseStatus from '@app/components/PromiseStatus';
import SpanBlockBox from '@app/components/SpanBlockBox';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useMemberInfoDialog from '@app/hooks/useMemberInfoDialog';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';
import {
  searchAnyStringProperty,
  searchMemberUsernameOrName,
} from '@app/utils/search-utils';

import {
  canSignUp,
  canSignUpAsCaptain,
  canSignUpAsHelper,
  createTimingInfoFragment,
  fakeRandomSignUpText,
  getTaskLocation,
  isContact,
  isHappeningNow,
  isSignedUp,
  isUpcoming,
} from './helpers-utils';

const StyledDataGrid = styled(DataGrid)(({theme}) => ({
  [`& .${gridClasses.row}.ycc-urgent`]: {
    backgroundColor: lighten(theme.palette.error.main, 0.85),
    '&:hover, &.Mui-hovered': {
      backgroundColor: lighten(theme.palette.error.main, 0.6),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
  },
})) as typeof DataGrid;

type Props = {
  year: number | null;
  search: string;
  showOnlyUpcoming: boolean;
  showOnlyContactOrSignedUp: boolean;
  showOnlyAvailable: boolean;
  showOnlyUnpublished: boolean;
};

const HelperTasksDataGrid = ({
  year,
  search,
  showOnlyUpcoming,
  showOnlyContactOrSignedUp,
  showOnlyAvailable,
  showOnlyUnpublished,
}: Props) => {
  const tasks = usePromise(
    (signal?: AbortSignal) => client.getHelperTasks(year, signal),
    [year]
  );
  const currentUser = useContext(AuthenticationContext).currentUser;
  const navigate = useNavigate();

  const {memberInfoDialogComponent, openMemberInfoDialog} =
    useMemberInfoDialog();

  const getRowId = (task: HelperTask) => task.id;

  const filterSearchMember = (searchToken: string, member?: MemberPublicInfo) =>
    (member && searchMemberUsernameOrName(searchToken, member)) ?? false;

  const filterSearch = (search: string, tasks: HelperTasks) => {
    // The user might want to search for a combination of things such as "J80 maintenance jib" or "MicMac Tim"
    const searchTokens = search
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map(s => s.trim())
      .filter(s => s);

    if (searchTokens) {
      return tasks.filter(task => {
        return searchTokens.every(token => {
          return (
            task.category.title.toLowerCase().includes(token) ||
            filterSearchMember(token, task.contact) ||
            filterSearchMember(token, task.captain?.member) ||
            task.helpers.some(helper =>
              filterSearchMember(token, helper.member)
            ) ||
            searchAnyStringProperty(token, task)
          );
        });
      });
    } else {
      return tasks;
    }
  };

  const filter = (search: string, tasks: HelperTasks) => {
    return filterSearch(
      search,
      tasks
        .filter(task =>
          showOnlyUpcoming ? isHappeningNow(task) || isUpcoming(task) : true
        )
        .filter(task =>
          showOnlyContactOrSignedUp
            ? isContact(task, currentUser) || isSignedUp(task, currentUser)
            : true
        )
        .filter(task =>
          showOnlyAvailable ? canSignUp(task, currentUser) : true
        )
        .filter(task => (showOnlyUnpublished ? !task.published : true))
    );
  };

  const handleGridClick = (
    params: GridCellParams,
    event: MuiEvent<React.MouseEvent<HTMLElement>>
  ) => {
    const location = getTaskLocation(params.row.id);

    // Not an <a> but good enough
    if (event.ctrlKey) {
      // Note: blur/focus might not work depending on the browser
      window.open(location, '_blank')?.blur();
      window.focus();
    } else if (event.shiftKey) {
      // https://stackoverflow.com/a/726803
      window.open(
        location,
        '_blank',
        `height=${window.innerHeight},width=${window.innerWidth})`
      );
    } else {
      navigate(location);
    }
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
          <Link>{fakeRandomSignUpText(task.id, true)}</Link>
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
            <Link>{fakeRandomSignUpText(task.id, false)}</Link>
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
        <StyledDataGrid
          columns={columns}
          rows={filter(search, tasks.result)}
          getRowId={getRowId}
          onCellClick={handleGridClick}
          disableColumnFilter={true}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowClassName={(params: GridRowParams) =>
            (params.row as HelperTask).urgent ? 'ycc-urgent' : ''
          }
          rowHeight={78}
          sx={{
            // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
            minHeight: '265px',
            height: 'calc(100vh - 340px)',
          }}
        />
      )}

      <PromiseStatus outcomes={[tasks]} />

      {memberInfoDialogComponent}
    </>
  );
};

export default HelperTasksDataGrid;
