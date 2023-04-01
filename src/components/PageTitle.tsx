import Typography from '@mui/material/Typography';
import React from 'react';

type Props = {
  value: string;
  mobileValue?: string;
};

const PageTitle = ({value, mobileValue}: Props) => (
  <>
    <Typography variant="h2" sx={{display: {xs: 'block', sm: 'none'}}}>
      {mobileValue ?? value}
    </Typography>
    <Typography variant="h2" sx={{display: {xs: 'none', sm: 'block'}}}>
      {value}
    </Typography>
  </>
);

export default PageTitle;
