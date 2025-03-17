import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Toolbar from "@mui/material/Toolbar";

import SidebarMenu from "./SidebarMenu";

const drawerWidth = 240;

type SidebarProps = {
  mobileOpen: boolean;
  toggleDrawer: (open: boolean) => (event: React.SyntheticEvent) => void;
};

const Sidebar = (props: SidebarProps) => {
  const sidebarMenu = <SidebarMenu />;
  const commonDrawerSx = {
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
    },
  };

  return (
    <Box component="nav" onClick={props.toggleDrawer(false)}>
      <SwipeableDrawer
        variant="temporary"
        open={props.mobileOpen}
        onOpen={props.toggleDrawer(true)}
        onClose={props.toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "block", lg: "none" },
          ...commonDrawerSx,
        }}
        className="ycc-sidebar-mobile"
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>{sidebarMenu}</Box>
      </SwipeableDrawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "none", lg: "block" },
          ...commonDrawerSx,
        }}
        className="ycc-sidebar"
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>{sidebarMenu}</Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
