import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const BlockBox = styled(Box)({
  "&": {
    display: "block",
  },
});

/**
 * A Box component that renders as `<span>` with block display.
 *
 * Useful when `<div>` is not allowed.
 */
const SpanBlockBox = (props: React.ComponentProps<typeof Box>) => (
  <BlockBox as="span" {...props} />
);

export default SpanBlockBox;
