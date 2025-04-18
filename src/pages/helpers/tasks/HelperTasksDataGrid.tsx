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
import { JSX } from "react";

import useMemberInfoDialog from "@/components/dialogs/MemberInfoDialog/useMemberInfoDialog";
import SpanBlockBox from "@/components/layout/SpanBlockBox";
import DataGridCell from "@/components/ui/DataGrid/DataGridCell";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { useNavigate } from "@/hooks/useNavigate";
import { MemberPublicInfo } from "@/model/dtos";
import { HelperTask, HelperTaskHelper } from "@/model/helpers-dtos";
import { DATA_GRID_PAGE_SIZE_OPTIONS } from "@/utils/constants";

import HelperTaskTimingInfo from "../components/HelperTaskTimingInfo";
import { fakeRandomSignUpText } from "../helpers-format";
import {
  canSignUpAsCaptain,
  canSignUpAsHelper,
  getTaskLocation,
} from "../helpers-utils";

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
  tasks: Readonly<HelperTask[]>;
};

const HelperTasksDataGrid: React.FC<Props> = ({ tasks }) => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();

  const memberInfoDialog = useMemberInfoDialog();

  const getRowId = (task: HelperTask): number => task.id;

  const handleGridCellClick = async (
    params: GridCellParams<MemberPublicInfo>,
    event: MuiEvent<React.MouseEvent<HTMLElement>>,
  ): Promise<void> => await navigate(getTaskLocation(params.row.id), event);

  const openMemberInfoDialogFromGrid = (
    event: React.SyntheticEvent,
    member: MemberPublicInfo,
  ): void => {
    event.stopPropagation();
    memberInfoDialog.open({ member });
  };

  const createMemberDialogLink = (member: MemberPublicInfo): JSX.Element => (
    <Link
      sx={{ color: "grey", textDecorationColor: "grey" }}
      onClick={(event) => openMemberInfoDialogFromGrid(event, member)}
    >
      {member.username}
    </Link>
  );

  const renderTimingCell = (
    params: GridCellParams<HelperTask>,
  ): JSX.Element => {
    const task = params.row;
    return (
      <DataGridCell>
        <Typography variant="body2" align="center" width="100%">
          <HelperTaskTimingInfo task={task} />
        </Typography>
      </DataGridCell>
    );
  };

  const renderTaskCell = (params: GridCellParams<HelperTask>): JSX.Element => {
    const task = params.row;
    return (
      <DataGridCell>
        <Typography variant="body2">
          <SpanBlockBox>{task.title}</SpanBlockBox>
          <SpanBlockBox fontStyle="italic">{task.category.title}</SpanBlockBox>
        </Typography>
      </DataGridCell>
    );
  };

  const renderContactCell = (
    params: GridCellParams<HelperTask>,
  ): JSX.Element => {
    const task = params.row;

    return (
      <DataGridCell>
        <Typography variant="body2">
          {createMemberDialogLink(task.contact)}
        </Typography>
      </DataGridCell>
    );
  };

  const renderCaptainCell = (
    params: GridCellParams<HelperTask>,
  ): JSX.Element => {
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

  const renderHelpersCell = (
    params: GridCellParams<HelperTask>,
  ): JSX.Element => {
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
      minWidth: 50,
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
        disableColumnFilter
        pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
        getRowClassName={(params: GridRowParams<HelperTask>) =>
          params.row.urgent ? "ycc-urgent" : ""
        }
        rowHeight={78}
        sx={{
          // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
          minHeight: "265px",
          height: "calc(100vh - 255px)",
        }}
      />

      {memberInfoDialog.component}
    </>
  );
};

export default HelperTasksDataGrid;
