import Typography from "@mui/material/Typography";

type Props = {
  value: string;
  mobileValue?: string;
};

const PageTitle = ({ value, mobileValue }: Props) => {
  // Do not duplicate the title in the DOM if the mobile value is the same as the value
  return !mobileValue || value === mobileValue ? (
    <Typography variant="h2" className="ycc-page-title">
      {value}
    </Typography>
  ) : (
    <>
      <Typography
        variant="h2"
        sx={{ display: { xs: "block", sm: "none" } }}
        className="ycc-page-title"
      >
        {mobileValue ?? value}
      </Typography>
      <Typography
        variant="h2"
        sx={{ display: { xs: "none", sm: "block" } }}
        className="ycc-page-title"
      >
        {value}
      </Typography>
    </>
  );
};

export default PageTitle;
