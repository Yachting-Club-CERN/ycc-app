import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import useCurrentUser from "@/context/auth/useCurrentUser";
import { SX_FAB_POSITION } from "@/utils/constants";

const NewHelperTaskAction = (): React.ReactNode => {
  const currentUser = useCurrentUser();

  if (!currentUser.helpersAppAdminOrEditor) {
    return null;
  }

  return (
    <>
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/helpers/tasks/new"
        >
          New Task
        </Button>
      </Box>

      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        <Fab
          variant="extended"
          color="primary"
          component={RouterLink}
          to="/helpers/tasks/new"
          sx={SX_FAB_POSITION}
        >
          <AddIcon />
          <Typography variant="button" ml={1}>
            New Task
          </Typography>
        </Fab>
      </Box>
    </>
  );
};

export default NewHelperTaskAction;
