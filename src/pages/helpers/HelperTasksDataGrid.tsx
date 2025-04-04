import Link from "@mui/material/Link";
import { lighten, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowParams,
  MuiEvent,
  gridClasses,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import useMemberInfoDialog from "@/components/dialogs/MemberInfoDialog/useMemberInfoDialog";
import SpanBlockBox from "@/components/layout/SpanBlockBox";
import DataGridCell from "@/components/ui/DataGridCell";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { MemberPublicInfo } from "@/model/dtos";
import {
  HelperTask,
  HelperTaskHelper,
  HelperTasks,
} from "@/model/helpers-dtos";

import {
  createTimingInfoFragment,
  fakeRandomSignUpText,
} from "./helpers-format";
import {
  canSignUpAsCaptain,
  canSignUpAsHelper,
  getTaskLocation,
} from "./helpers-utils";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.ycc-urgent`]: {
    backgroundColor: lighten(theme.palette.error.main, 0.85),
    "&:hover, &.Mui-hovered": {
      backgroundColor: lighten(theme.palette.error.main, 0.6),
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
})) as typeof DataGrid;

type Props = {
  tasks: HelperTasks;
};

const HelperTasksDataGrid = ({ tasks }: Props) => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();

  const memberInfoDialog = useMemberInfoDialog();

  const getRowId = (task: HelperTask) => task.id;

  const handleGridCellClick = async (
    params: GridCellParams<MemberPublicInfo>,
    event: MuiEvent<React.MouseEvent<HTMLElement>>,
  ) => {
    const location = getTaskLocation(params.row.id);

    // Not an <a> but good enough
    if (event.ctrlKey) {
      // Note: blur/focus might not work depending on the browser
      window.open(location, "_blank")?.blur(); //NOSONAR
      window.focus();
    } else if (event.shiftKey) {
      // https://stackoverflow.com/a/726803
      window.open(
        location,
        "_blank",
        `height=${window.innerHeight},width=${window.innerWidth})`,
      );
    } else {
      await navigate(location);
    }
  };

  const openMemberInfoDialogFromGrid = (
    event: React.SyntheticEvent,
    member: MemberPublicInfo,
  ) => {
    event.stopPropagation();
    memberInfoDialog.open({ member });
  };

  const createMemberDialogLink = (member: MemberPublicInfo) => {
    return (
      <Link
        sx={{ color: "grey", textDecorationColor: "grey" }}
        onClick={(event) => openMemberInfoDialogFromGrid(event, member)}
      >
        {member.username}
      </Link>
    );
  };

  const renderTimingCell = (params: GridCellParams<HelperTask>) => {
    const task = params.row;
    return (
      <DataGridCell>
        <Typography variant="body2" align="center" width="100%">
          {createTimingInfoFragment(task)}
        </Typography>
      </DataGridCell>
    );
  };

  const renderTaskCell = (params: GridCellParams<HelperTask>) => {
    const task = params.row;
    return (
      <DataGridCell>
        <Typography variant="body2">
          <SpanBlockBox>{task.title}</SpanBlockBox>
          <SpanBlockBox sx={{ fontStyle: "italic" }}>
            {task.category.title}
          </SpanBlockBox>
        </Typography>
      </DataGridCell>
    );
  };

  const renderContactCell = (params: GridCellParams<HelperTask>) => {
    const task = params.row;

    return (
      <DataGridCell>
        <Typography variant="body2">
          {createMemberDialogLink(task.contact)}
        </Typography>
      </DataGridCell>
    );
  };

  const renderCaptainCell = (params: GridCellParams<HelperTask>) => {
    const task = params.row;

    if (task.captain) {
      return (
        <DataGridCell>
          <Typography variant="body2">
            {createMemberDialogLink(task.captain.member)}
          </Typography>
        </DataGridCell>
      );
    } else if (canSignUpAsCaptain(task, currentUser)) {
      return (
        <DataGridCell>
          <Typography variant="body2">
            <Link>{fakeRandomSignUpText(task.id, true)}</Link>
          </Typography>
        </DataGridCell>
      );
    } else {
      return <DataGridCell />;
    }
  };

  const renderHelpersCell = (params: GridCellParams<HelperTask>) => {
    const task = params.row;

    return (
      <DataGridCell>
        <Typography variant="body2">
          {canSignUpAsHelper(task, currentUser) && (
            <SpanBlockBox>
              <Link>{fakeRandomSignUpText(task.id, false)}</Link>
            </SpanBlockBox>
          )}
          {[...task.helpers]
            .sort((lhs: HelperTaskHelper, rhs: HelperTaskHelper) =>
              lhs.member.username.localeCompare(rhs.member.username),
            )
            .map((helper: HelperTaskHelper) => {
              return (
                <SpanBlockBox key={helper.member.username}>
                  {createMemberDialogLink(helper.member)}
                </SpanBlockBox>
              );
            })}
        </Typography>
      </DataGridCell>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Timing",
      width: 200,
      renderCell: renderTimingCell,
      sortable: false,
    },
    {
      field: "title",
      headerName: "Task",
      width: 200,
      renderCell: renderTaskCell,
      sortable: false,
    },
    {
      field: "shortDescription",
      headerName: "Short Description",
      minWidth: 300,
      flex: 1,
      sortable: false,
    },
    {
      field: "contact",
      headerName: "Contact",
      width: 120,
      renderCell: renderContactCell,
      sortable: false,
    },
    {
      field: "captain",
      headerName: "Captain",
      width: 120,
      renderCell: renderCaptainCell,
      sortable: false,
    },
    {
      field: "helpers",
      headerName: "Helpers",
      width: 120,
      renderCell: renderHelpersCell,
      sortable: false,
    },
  ];

  return (
    <>
      <StyledDataGrid
        columns={columns}
        rows={tasks}
        getRowId={getRowId}
        onCellClick={handleGridCellClick}
        disableColumnFilter={true}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowClassName={(params: GridRowParams<HelperTask>) =>
          params.row.urgent ? "ycc-urgent" : ""
        }
        rowHeight={78}
        sx={{
          // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
          minHeight: "265px",
          height: "calc(100vh - 370px)",
        }}
      />

      {memberInfoDialog.component}
    </>
  );
};

export default HelperTasksDataGrid;
