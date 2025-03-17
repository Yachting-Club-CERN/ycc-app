import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

/**
 * A Box component with default spacing.
 */
const SpacedBox = styled(Box)({
  "&": {
    marginTop: "1rem",
    marginBottom: "1rem",
    textAlign: "justify",
  },
}) as typeof Box;

export default SpacedBox;
