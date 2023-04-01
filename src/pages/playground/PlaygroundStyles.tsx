import React from 'react';

import PageTitle from '@app/components/PageTitle';
import SpacedTypography from '@app/components/SpacedTypography';

import LoremIpsum from './LoremIpsum';

const PlaygroundStyles = () => {
  return (
    <>
      <PageTitle value="Playground: Styles" />

      <SpacedTypography variant="h2">
        SpacedTypography Heading Variants
      </SpacedTypography>
      <SpacedTypography variant="h1">Demo: Heading 1</SpacedTypography>
      <SpacedTypography variant="h2">Demo: Heading 2</SpacedTypography>
      <SpacedTypography variant="h3">Demo: Heading 3</SpacedTypography>
      <SpacedTypography variant="h4">Demo: Heading 4</SpacedTypography>
      <SpacedTypography variant="h5">Demo: Heading 5</SpacedTypography>
      <SpacedTypography variant="h6">Demo: Heading 6</SpacedTypography>

      <SpacedTypography variant="h2">
        SpacedTypography Text Variants
      </SpacedTypography>
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
