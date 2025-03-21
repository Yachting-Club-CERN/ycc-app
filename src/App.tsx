import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Toolbar from "@mui/material/Toolbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "@/layouts/AppRoutes";
import Footer from "@/layouts/Footer";
import TopBarAndSidebar from "@/layouts/TopBarAndSidebar";

import { theme } from "./Theme";

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <BrowserRouter>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <ThemeProvider theme={theme}>
            <TopBarAndSidebar />
            <Box sx={{ width: "100%", p: 2 }}>
              <Toolbar />
              <Stack>
                <Box component="main">
                  <AppRoutes />
                </Box>
                <Divider sx={{ mt: 2 }} />
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
