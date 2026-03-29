import Box, { BoxProps } from "@mui/material/Box";

type Props = Omit<BoxProps, "component">;

/**
 * A Box component that renders as `<span>`.
 */
const Span = (props: Props): React.ReactNode => (
  <Box component="span" {...props} />
);

export default Span;
