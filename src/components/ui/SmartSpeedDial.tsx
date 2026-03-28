import Fab, { FabProps } from "@mui/material/Fab";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { SvgIconProps } from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";
import { Link as RouterLink } from "react-router-dom";

type Action = {
  icon: React.ReactElement<SvgIconProps>;
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
const SmartSpeedDial = ({ actions }: Props): React.ReactNode => {
  if (actions.length === 0) {
    return null;
  }
  const firstAction = actions[0]!;

  const sxPosition = {
    position: "fixed",
    bottom: { xs: 16, md: 48 },
    right: { xs: 16, md: 48 },
  };

  if (actions.length === 1) {
    return (
      <Tooltip title={firstAction.name}>
        <Fab
          color="primary"
          component={RouterLink}
          to={firstAction.href}
          sx={sxPosition}
        >
          {firstAction.icon}
        </Fab>
      </Tooltip>
    );
  }

  return (
    <SpeedDial ariaLabel="Actions" icon={firstAction.icon} sx={sxPosition}>
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
