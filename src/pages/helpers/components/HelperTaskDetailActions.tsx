import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fab, { FabProps } from "@mui/material/Fab";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import useCurrentUser from "@/context/auth/useCurrentUser";
import { HelperTask } from "@/model/helpers-dtos";
import {
  canEdit,
  getTaskCloneLocation,
  getTaskEditLocation,
} from "@/pages/helpers/helpers-utils";
import { SX_FAB_POSITION } from "@/utils/constants";

import useBulkCloneDialog from "./bulk-clone/useBulkCloneDialog";

type LinkAction = {
  icon: React.ReactElement;
  name: string;
  to: string;
};

type CallbackAction = {
  icon: React.ReactElement;
  name: string;
  onClick: () => void;
};

type Action = LinkAction | CallbackAction;

const isLinkAction = (action: Action): action is LinkAction => "to" in action;

type Props = {
  task: HelperTask;
};

const HelperTaskDetailActions = ({ task }: Props): React.ReactNode => {
  const currentUser = useCurrentUser();
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const bulkCloneDialog = useBulkCloneDialog();

  if (!currentUser.helpersAppAdminOrEditor) {
    return null;
  }

  if (!canEdit(task, currentUser)) {
    return (
      <>
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/helpers/tasks/new"
          >
            New Task
          </Button>
        </Box>
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <Fab
            variant="extended"
            color="primary"
            component={RouterLink}
            to="/helpers/tasks/new"
            sx={SX_FAB_POSITION}
          >
            <AddIcon />
            <Typography variant="button" ml={1}>
              New Task
            </Typography>
          </Fab>
        </Box>
      </>
    );
  }

  const closeMenu = (): void => {
    setMenuAnchor(null);
  };

  const openBulkClone = (): void => {
    closeMenu();
    setSpeedDialOpen(false);
    bulkCloneDialog.open(task);
  };

  const actions: Action[] = [
    { icon: <EditIcon />, name: "Edit Task", to: getTaskEditLocation(task.id) },
    {
      icon: <ContentCopyIcon />,
      name: "Clone Task",
      to: getTaskCloneLocation(task.id),
    },
    {
      icon: <DateRangeIcon />,
      name: "Clone to Multiple Dates",
      onClick: openBulkClone,
    },
    { icon: <AddIcon />, name: "New Task", to: "/helpers/tasks/new" },
  ];

  return (
    <>
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <Button
          variant="contained"
          startIcon={<MoreVertIcon />}
          onClick={(e) => {
            setMenuAnchor(e.currentTarget);
          }}
        >
          Actions
        </Button>
        <Menu
          anchorEl={menuAnchor}
          open={menuAnchor !== null}
          onClose={closeMenu}
        >
          {actions.map((action) =>
            isLinkAction(action) ? (
              <MenuItem
                key={action.name}
                component={RouterLink}
                to={action.to}
                onClick={closeMenu}
              >
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText>{action.name}</ListItemText>
              </MenuItem>
            ) : (
              <MenuItem key={action.name} onClick={action.onClick}>
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText>{action.name}</ListItemText>
              </MenuItem>
            ),
          )}
        </Menu>
      </Box>

      {speedDialOpen && (
        <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.speedDial - 1 }} />
      )}
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        <SpeedDial
          ariaLabel="Task actions"
          icon={<EditIcon />}
          sx={SX_FAB_POSITION}
          open={speedDialOpen}
          onOpen={() => {
            setSpeedDialOpen(true);
          }}
          onClose={() => {
            setSpeedDialOpen(false);
          }}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              slotProps={{
                fab: isLinkAction(action)
                  ? ({
                      component: RouterLink,
                      to: action.to,
                    } as Partial<FabProps>)
                  : ({
                      onClick: action.onClick,
                    } as Partial<FabProps>),
                tooltip: { title: action.name, open: true },
                staticTooltipLabel: {
                  style: { whiteSpace: "nowrap" },
                },
              }}
            />
          ))}
        </SpeedDial>
      </Box>

      {bulkCloneDialog.component}
    </>
  );
};

export default HelperTaskDetailActions;
