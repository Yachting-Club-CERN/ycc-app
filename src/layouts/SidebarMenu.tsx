import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ErrorIcon from "@mui/icons-material/Error";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import HomeIcon from "@mui/icons-material/Home";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LanguageIcon from "@mui/icons-material/Language";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import SailingIcon from "@mui/icons-material/Sailing";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import React, { JSX } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import config, { Environment } from "@/config";
import useAuth from "@/context/auth/useAuth";

import { externalUrls } from "./ExternalUrls";

type SidebarItem = {
  title: string;
  path: string;
  icon: JSX.Element;
};

const SidebarMenu = () => {
  const location = useLocation();
  const auth = useAuth();
  const currentUser = auth.currentUser;

  const items: SidebarItem[][] = [
    [{ title: "Home", path: "/", icon: <HomeIcon /> }],
    [
      {
        title: "Reserve a Boat",
        path: externalUrls.yccBoatBooking,
        icon: <SailingIcon />,
      },
      {
        title: "Help the Club!",
        path: "/helpers",
        icon: <AccessibilityNewIcon />,
      },
      {
        title: "Member List",
        path: "/members",
        icon: <PeopleIcon />,
      },
    ],
    [
      {
        title: "Go to the Website",
        path: externalUrls.yccWebsite,
        icon: <LanguageIcon />,
      },
    ],
  ];

  if (currentUser.helpersAppAdmin) {
    items.push([
      {
        title: "Permissions",
        path: "/admin/permissions",
        icon: <HowToRegIcon />,
      },
    ]);
  }

  if (config.environment === Environment.LOCAL) {
    items.push([
      {
        title: "Playground: 404",
        path: "/playground/this-page-is-definitely-not-declared-in-the-routes",
        icon: <ErrorIcon />,
      },
      {
        title: "Playground: Editor",
        path: "/playground/editor",
        icon: <AutoFixHighIcon />,
      },
      {
        title: "Playground: Error",
        path: "/playground/error",
        icon: <ErrorIcon />,
      },
      {
        title: "Playground: Styles",
        path: "/playground/styles",
        icon: <FormatColorFillIcon />,
      },
    ]);
  }

  return (
    <>
      <List>
        <ListItem
          key="user-info"
          disablePadding
          secondaryAction={
            <IconButton onClick={auth.logout}>
              <LogoutIcon />
            </IconButton>
          }
        >
          <ListItemButton
            selected={"/profile" === location.pathname}
            component={RouterLink}
            to="/profile"
          >
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary={auth.currentUser.firstName} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {items.map((itemGroup, index) => (
        <React.Fragment key={`group_${index}`}>
          <Divider />
          <List>
            {itemGroup.map((item) => {
              const props = item.path.startsWith("/")
                ? {
                    selected: item.path === location.pathname,
                    component: RouterLink,
                    to: item.path,
                  }
                : {
                    component: Link,
                    href: item.path,
                    target: "_blank",
                    rel: "noopener",
                  };

              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={item.path === location.pathname}
                    {...props}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </React.Fragment>
      ))}

      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
        <Box
          component="img"
          sx={{ height: 192 }}
          src={`${import.meta.env.BASE_URL}logo192.png`}
          alt="YCC Logo"
        />
      </Box>
    </>
  );
};

export default SidebarMenu;
