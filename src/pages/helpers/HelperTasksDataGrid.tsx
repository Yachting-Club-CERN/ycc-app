import {Typography} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import {DataGrid, GridCellParams, GridColDef} from '@mui/x-data-grid';
import {MemberPublicInfo} from 'model/dtos';
import {HelperTask, HelperTaskHelper} from 'model/helpers-dtos';
import React, {useState} from 'react';

import ErrorAlert from '@app/components/ErrorAlert';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';
import {formatDate, formatDateTime} from '@app/utils/date-utils';

// TODO Dialog to show detailed view, but at least long description

const columns: GridColDef[] = [
  {
    field: 'date',
    headerName: 'Date',
    align: 'center',
    width: 200,
    renderCell: (params: GridCellParams) => {
      const task = params.row as HelperTask;
      if (task.deadline && !task.start && !task.end) {
        return (
          <Typography align="center" variant="body2">
            {formatDateTime(task.deadline)}
            <br />
            Deadline!
          </Typography>
        );
      } else if (task.start && task.end) {
        const sameDayEnd =
          new Date(task.start).getDate() === new Date(task.end).getDate() &&
          false;
        if (sameDayEnd) {
          return (
            <>
              {formatDateTime(task.start)}
              <br />
              {formatDateTime(task.end)}
            </>
          );
        } else {
          return (
            <Typography align="center" variant="body2">
              {formatDateTime(task.start)}
              <br />
              --
              <br />
              {formatDateTime(task.end)}
            </Typography>
          );
        }
      } else {
        // Fallback for inconsistent data
        return (
          <Typography align="center" variant="body2">
            Start: {task.start ?? '-'}
            <br />
            {/* <br> */}
            End: {task.end ?? '-'}
            <br />
            {/* <br> */}
            Deadline: {task.deadline ?? '-'};
          </Typography>
        );
      }
    },
  },
  {field: 'title', headerName: 'Title', width: 200},
  {field: 'shortDescription', headerName: 'Short Description', width: 200},
  {
    field: 'contact',
    headerName: 'Contact',
    width: 50,
    valueGetter: params => (params.value as MemberPublicInfo).username,
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
    width: 200,
    valueGetter: params =>
      (params.value as HelperTaskHelper)?.member.username ?? 'WE NEED ONE',
    // valueGetter: params =>
    //   params.row.captain
    //     ? `${params.row.captain.member.firstName} ${params.row.captain.member.lastName}`
    //     : '',
  },
  {
    field: 'helpers',
    headerName: 'Helpers',
    width: 200,
    valueGetter: params =>
      params.row.helpers
        .map(
          (h: HelperTaskHelper) => `${h.member.firstName} ${h.member.lastName}`
        )
        .join(', '),
  },
];

const HelperTasksDataGrid = () => {
  const {result: tasks, error, pending} = usePromise(client.getHelperTasks);

  // const [selected, setSelected] = useState<MemberPublicInfo | null>(null);

  const getRowId = (task: HelperTask) => task.id;
  const handleGridClick = (params: GridCellParams) => {
    alert('Clicked! ' + params.row);
  };

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
          sx={{
            // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
            minHeight: '215px',
            height: 'calc(100vh - 260px)',
          }}
        />
      )}
      {error && <ErrorAlert error={error} />}
      {pending && <CircularProgress />}
    </>
  );
};

export default HelperTasksDataGrid;
