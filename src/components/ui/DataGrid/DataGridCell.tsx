import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const DataGridCell = styled(Box)({
  "&": {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
}) as typeof Box;

export default DataGridCell;
