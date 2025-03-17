import { Variant } from "@mui/material/styles/createTypography";

import SpacedTypography from "@/components/SpacedTypography";

type Props = {
  title: string;
  titleVariant: Variant;
  variant?: Variant;
};

const LoremIpsum = ({ title, titleVariant, variant }: Props) => {
  return (
    <>
      <SpacedTypography variant={titleVariant}>{title}</SpacedTypography>
      <SpacedTypography variant={variant}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ut
        dignissim purus, a malesuada leo. Duis quam magna, facilisis in accumsan
        at, efficitur ut tortor. Phasellus a placerat arcu. Nunc pretium posuere
        metus id tincidunt. Etiam lacus elit, porta in posuere et, aliquet a
        turpis. In vitae elit erat. Vestibulum dictum, mauris at lobortis
        auctor, elit tortor tincidunt nunc, at elementum risus dui eget velit.
        Ut maximus, turpis vel tincidunt tempus, neque risus luctus velit, vel
        blandit odio nulla quis ex. Vivamus tincidunt tellus id arcu viverra, a
        cursus elit scelerisque. Cras efficitur eros quis ante interdum
        hendrerit. Vestibulum interdum, massa quis fringilla tempus, turpis
        purus porttitor risus, in ultrices felis leo et nunc. Vivamus a
        porttitor lorem. Praesent vulputate arcu in commodo semper. Morbi ac
        pharetra ante. Vivamus bibendum eleifend sollicitudin.
      </SpacedTypography>
      <SpacedTypography variant={variant}>
        Sed viverra, tellus quis condimentum tempor, libero nunc condimentum
        orci, ac consectetur magna leo sed lacus. Maecenas pellentesque blandit
        magna ac euismod. Nulla lorem velit, sagittis quis sem quis, aliquam
        mollis libero. Phasellus et tincidunt tellus. Praesent ante nulla,
        euismod et lorem vel, egestas imperdiet sem. Nulla porta arcu vel
        vestibulum venenatis. Quisque dapibus orci eu quam ullamcorper
        pellentesque eu in tortor. Praesent placerat metus eget pretium rutrum.
        In tempus, turpis non gravida eleifend, nulla velit porta nisi, sed
        sollicitudin metus nisl vitae ante. Donec tempor mi quis massa
        vestibulum, ac convallis tellus laoreet. Integer augue nibh, convallis
        ut posuere non, pretium nec nunc. Mauris vulputate, nulla eget egestas
        gravida, nisi arcu egestas erat, in rutrum felis lacus eu sem.
      </SpacedTypography>
    </>
  );
};

export default LoremIpsum;
