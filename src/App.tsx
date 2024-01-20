import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {theme} from 'Theme';
import 'dayjs/locale/en-gb';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';

import AppRoutes from '@app/layouts/AppRoutes';
import Footer from '@app/layouts/Footer';
import TopBarAndSidebar from '@app/layouts/TopBarAndSidebar';

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <BrowserRouter>
        <Box sx={{display: 'flex'}}>
          <CssBaseline />
          <ThemeProvider theme={theme}>
            <TopBarAndSidebar />
            <Box sx={{width: '100%', p: 2}}>
              <Toolbar />
              <Stack>
                <Box component="main">
                  <AppRoutes />
                </Box>
                <Divider sx={{mt: 2}} />
                <Box component="div" className="ycc-footer">
                  <Footer />
                </Box>
              </Stack>
            </Box>
          </ThemeProvider>
        </Box>
      </BrowserRouter>
    </LocalizationProvider>
  );
};

export default App;
