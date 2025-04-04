import Fab, { FabProps } from "@mui/material/Fab";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { SvgIconProps } from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";
import { ReactElement } from "react";
import { Link as RouterLink } from "react-router-dom";

type Action = {
  icon: ReactElement<SvgIconProps>;
  name: string;
  href: string;
};

type Props = {
  actions: Action[];
};

/**
 * SmartSpeedDial is a responsive floating action button (FAB) that conditionally behaves like:
 * - A simple FAB when only one action is provided
 * - A SpeedDial with multiple actions when more are given
 */
const SmartSpeedDial = ({ actions }: Props) => {
  if (actions.length === 0) {
    return null;
  }

  const sxPosition = {
    position: "fixed",
    bottom: { xs: 16, md: 48 },
    right: { xs: 16, md: 48 },
  };

  const singleAction = actions.length === 1;

  if (singleAction) {
    const [action] = actions;

    return (
      <Tooltip title={action.name}>
        <Fab
          color="primary"
          component={RouterLink}
          to={action.href}
          sx={sxPosition}
        >
          {action.icon}
        </Fab>
      </Tooltip>
    );
  }

  return (
    <SpeedDial ariaLabel="Actions" icon={actions[0].icon} sx={sxPosition}>
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          slotProps={{
            fab: {
              component: RouterLink,
              to: action.href,
            } as Partial<FabProps>,
            tooltip: {
              title: action.name,
            },
          }}
        />
      ))}
    </SpeedDial>
  );
};

export default SmartSpeedDial;
