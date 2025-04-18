import Stack, { StackProps } from "@mui/material/Stack";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  wrap: boolean;
  compact?: boolean;
  alignItems?: StackProps["alignItems"];
} & Omit<
  StackProps,
  "direction" | "spacing" | "useFlexGap" | "flexWrap" | "display"
>;

const RowStack: React.FC<Props> = ({
  wrap,
  compact = false,
  alignItems = "center",
  children,
  ...rest
}) => {
  // Dynamic way to detect if the children are empty (e.g., components which return null)
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasVisibleContent, setHasVisibleContent] = useState(true);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    setHasVisibleContent(containerRef.current.childNodes.length > 0);
  }, [children]);

  // Detect if no children was passed to the component
  if (
    !React.Children.toArray(children).some(
      (child) => child !== null && child !== undefined,
    )
  ) {
    return null;
  }

  return (
    <Stack
      ref={containerRef}
      direction="row"
      spacing={compact ? 1 : 2}
      useFlexGap={wrap}
      flexWrap={wrap ? "wrap" : undefined}
      alignItems={alignItems}
      display={hasVisibleContent ? "flex" : "none"}
      {...rest}
    >
      {children}
    </Stack>
  );
};

export default RowStack;
