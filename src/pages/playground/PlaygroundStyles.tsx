import Typography from '@mui/material/Typography';
import React from 'react';

import PageTitle from '@app/components/PageTitle';

import LoremIpsum from './LoremIpsum';

const PlaygroundStyles = () => {
  return (
    <>
      <PageTitle value="Playground: Styles" />

      <Typography variant="h2">Typography Heading Variants</Typography>
      <Typography variant="h1">Demo: Heading 1</Typography>
      <Typography variant="h2">Demo: Heading 2</Typography>
      <Typography variant="h3">Demo: Heading 3</Typography>
      <Typography variant="h4">Demo: Heading 4</Typography>
      <Typography variant="h5">Demo: Heading 5</Typography>
      <Typography variant="h6">Demo: Heading 6</Typography>

      <Typography variant="h2">Typography Text Variants</Typography>
      <LoremIpsum title="Default" titleVariant="h3" />
      <LoremIpsum title="Body 1" titleVariant="h3" variant="body1" />
      <LoremIpsum title="Body 2" titleVariant="h3" variant="body2" />
      <LoremIpsum title="Button" titleVariant="h3" variant="button" />
      <LoremIpsum title="Caption" titleVariant="h3" variant="caption" />
      <LoremIpsum title="Overline" titleVariant="h3" variant="overline" />
      <LoremIpsum title="Subtitle1" titleVariant="h3" variant="subtitle1" />
      <LoremIpsum title="Subtitle1" titleVariant="h3" variant="subtitle2" />
    </>
  );
};

export default PlaygroundStyles;
