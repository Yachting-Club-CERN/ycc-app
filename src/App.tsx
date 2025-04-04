import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Toolbar from "@mui/material/Toolbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "@/layouts/AppRoutes";
import Footer from "@/layouts/Footer";
import TopBarAndSidebar from "@/layouts/TopBarAndSidebar";

import useCurrentUser from "./context/auth/useCurrentUser";
import useSharedData from "./context/shared-data/useSharedData";
import { theme } from "./Theme";
import { getCurrentYear } from "./utils/date-utils";

const App = () => {
  const currentUser = useCurrentUser();
  const sharedData = useSharedData();

  // Prefetch for admin/editor since they will need it sooner or later
  useEffect(() => {
    if (!currentUser.helpersAppAdminOrEditor) {
      return;
    }

    const timer = setTimeout(() => {
      console.info("Loading shared data (user is admin or editor)...");

      void sharedData.getHelperTaskCategories();
      void sharedData.getLicenceInfos();
      void sharedData.getMembers(getCurrentYear());
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [currentUser.helpersAppAdminOrEditor, sharedData]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <BrowserRouter>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <ThemeProvider theme={theme}>
            <TopBarAndSidebar />
            <Box sx={{ width: "100%", p: 2 }}>
              <Toolbar />
              <Stack direction="column">
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
