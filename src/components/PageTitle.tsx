import React from 'react';

import SpacedTypopgraphy from './SpacedTypography';

type Props = {
  value: string;
  mobileValue?: string;
};

const PageTitle = ({value, mobileValue}: Props) => (
  <>
    <SpacedTypopgraphy variant="h2" sx={{display: {xs: 'block', sm: 'none'}}}>
      {mobileValue ?? value}
    </SpacedTypopgraphy>
    <SpacedTypopgraphy variant="h2" sx={{display: {xs: 'none', sm: 'block'}}}>
      {value}
    </SpacedTypopgraphy>
  </>
);

export default PageTitle;
