import Typography, { TypographyProps } from "@mui/material/Typography";

import Span from "@/components/layout/Span";
import useDocumentTitle from "@/hooks/useDocumentTitle";

type Props = {
  value: string;
  mobileValue?: string | undefined;
  mb?: TypographyProps["mb"] | undefined;
};

const PageTitle = ({ value, mobileValue, mb = 2 }: Props): React.ReactNode => {
  useDocumentTitle(value);

  return (
    <Typography variant="h2" className="ycc-page-title" mb={mb}>
      <Span sx={{ display: { xs: "inline", sm: "none" } }}>
        {mobileValue ?? value}
      </Span>
      <Span sx={{ display: { xs: "none", sm: "inline" } }}>{value}</Span>
    </Typography>
  );
};

export default PageTitle;
