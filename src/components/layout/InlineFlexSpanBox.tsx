import Box, { BoxProps } from "@mui/material/Box";

const InlineFlexSpanBox = (
  props: Omit<BoxProps, "component" | "display" | "alignItems">,
) => (
  <Box component="span" display="inline-flex" alignItems="center" {...props} />
);

export default InlineFlexSpanBox;
