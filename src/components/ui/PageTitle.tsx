import Typography from "@mui/material/Typography";

import Span from "@/components/layout/Span";

type Props = {
  value: string;
  mobileValue?: string | undefined;
};

const PageTitle = ({ value, mobileValue }: Props): React.ReactNode => {
  return (
    <Typography variant="h2" className="ycc-page-title" mb={2}>
      <Span sx={{ display: { xs: "inline", sm: "none" } }}>
        {mobileValue ?? value}
      </Span>
      <Span sx={{ display: { xs: "none", sm: "inline" } }}>{value}</Span>
    </Typography>
  );
};

export default PageTitle;
