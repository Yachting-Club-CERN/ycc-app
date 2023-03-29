import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import {theme} from 'Theme';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';

import AppRoutes from '@app/layouts/AppRoutes';
import Footer from '@app/layouts/Footer';
import TopBarAndSidebar from '@app/layouts/TopBarAndSidebar';

const App = () => {
  return (
    <BrowserRouter>
      <Box sx={{display: 'flex'}}>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <TopBarAndSidebar />
          <Box sx={{width: '100%', pl: 2, pr: 2}}>
            <Toolbar />
            <Stack>
              <Box component="main">
                <AppRoutes />
              </Box>
              <Divider />
              <Box component="div">
                <Footer />
              </Box>
            </Stack>
          </Box>
        </ThemeProvider>
      </Box>
    </BrowserRouter>
  );
};

export default App;
