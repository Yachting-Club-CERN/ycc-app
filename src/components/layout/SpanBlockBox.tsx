import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const BlockBox = styled(Box)({
  "&": {
    display: "block",
  },
}) as typeof Box;

/**
 * A Box component that renders as `<span>` with block display.
 *
 * Useful when `<div>` is not allowed.
 */
const SpanBlockBox = (props: React.ComponentProps<typeof Box>) => (
  <BlockBox component="span" {...props} />
);

export default SpanBlockBox;
