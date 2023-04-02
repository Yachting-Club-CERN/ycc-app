import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import config, {Environment} from 'config';
import React from 'react';

import {externalUrls} from './ExternalUrls';

type TopBarProps = {
  toggleDrawer: (event: React.SyntheticEvent) => void;
};

const TopBar = (props: TopBarProps) => {
  const alertEnvironmentInfo = () => {
    alert(`Current environment: ${config.environment}

PRODUCTION:
    Production instance with real data, what we use for club life.

TEST:
    Test instance with copy of real data (data might be outdated).

DEVELOPMENT:
    Development instance test data (no personal information).

LOCAL:
    Someone's local instance with test data.`);
  };

  const topRightCorner =
    config.environment === Environment.PRODUCTION ? (
      <Typography
        variant="subtitle1"
        component="div"
        textAlign="right"
        flexGrow={1}
      >
        <em>Fair winds!</em>
      </Typography>
    ) : (
      <Box textAlign="right" flexGrow={1}>
        <Button
          onClick={alertEnvironmentInfo}
          variant="contained"
          color="secondary"
        >
          ☢️ {config.environment} ☢️
        </Button>
      </Box>
    );

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
        <Typography component="h1" variant="h6" flexGrow={2}>
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

        {topRightCorner}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
