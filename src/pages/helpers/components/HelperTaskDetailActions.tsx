import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { FabProps } from "@mui/material/Fab";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import RowStack from "@/components/layout/RowStack";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { HelperTask } from "@/model/helpers-dtos";
import {
  getTaskCloneLocation,
  getTaskEditLocation,
} from "@/pages/helpers/helpers-utils";
import { SX_FAB_POSITION } from "@/utils/constants";

type Props = {
  task: HelperTask;
};

const HelperTaskDetailActions = ({ task }: Props): React.ReactNode => {
  const currentUser = useCurrentUser();
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  if (!currentUser.helpersAppAdminOrEditor) {
    return null;
  }

  const editAction = {
    icon: <EditIcon />,
    name: "Edit Task",
    to: getTaskEditLocation(task.id),
  };
  const cloneAction = {
    icon: <ContentCopyIcon />,
    name: "Clone Task",
    to: getTaskCloneLocation(task.id),
  };
  const newAction = {
    icon: <AddIcon />,
    name: "New Task",
    to: "/helpers/tasks/new",
  };

  const buttonActions = [newAction, editAction, cloneAction];
  const fabActions = [editAction, cloneAction, newAction];

  return (
    <>
      <Box sx={{ display: { xs: "none", sm: "flex" } }}>
        <RowStack wrap={true} compact={true}>
          {buttonActions.map((action) => (
            <Button
              key={action.name}
              variant="contained"
              startIcon={action.icon}
              component={RouterLink}
              to={action.to}
            >
              {action.name}
            </Button>
          ))}
        </RowStack>
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
          {fabActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              slotProps={{
                fab: {
                  component: RouterLink,
                  to: action.to,
                } as Partial<FabProps>,
                tooltip: { title: action.name, open: true },
                staticTooltipLabel: {
                  style: { whiteSpace: "nowrap" },
                },
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    </>
  );
};

export default HelperTaskDetailActions;
