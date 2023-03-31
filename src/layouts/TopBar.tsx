import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';

import {externalUrls} from './ExternalUrls';

type TopBarProps = {
  toggleDrawer: (event: React.SyntheticEvent) => void;
};

const TopBar = (props: TopBarProps) => {
  return (
    <AppBar position="fixed" sx={{zIndex: theme => theme.zIndex.drawer + 1}}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{
            display: {xs: 'block', sm: 'block', lg: 'none'},
            mr: 2,
          }}
          onClick={props.toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
        <Typography component="h1" variant="h6" flexGrow="3">
          YCC App{' '}
          <Link
            href={externalUrls.yccBoatBooking}
            target="_blank"
            rel="noopener"
            sx={{fontSize: '1.25rem'}}
          >
            ⛵
          </Link>
        </Typography>
        <Typography
          variant="subtitle1"
          component="div"
          textAlign="right"
          flexGrow="1"
        >
          <em>Fair winds!</em>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
