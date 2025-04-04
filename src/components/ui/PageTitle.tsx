import Typography from "@mui/material/Typography";

type Props = {
  value: string;
  mobileValue?: string;
};

const PageTitle = ({ value, mobileValue }: Props) => {
  // Do not duplicate the title in the DOM if the mobile value is the same as the value
  const commonProps = {
    variant: "h2",
    className: "ycc-page-title",
    mb: 2,
  } as const;

  return !mobileValue || value === mobileValue ? (
    <Typography {...commonProps}>{value}</Typography>
  ) : (
    <>
      <Typography
        {...commonProps}
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        {mobileValue ?? value}
      </Typography>
      <Typography
        {...commonProps}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {value}
      </Typography>
    </>
  );
};

export default PageTitle;
