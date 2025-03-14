import Box from '@mui/material/Box';
import {styled} from '@mui/material/styles';

/**
 * A Box component with underlying component &lt;span%gt;.
 */
const SpanBlockBox = styled(Box)({
  '&': {
    display: 'block',
  },
});

SpanBlockBox.defaultProps = {
  component: 'span',
};

const SpanBlockBoxAsBox = SpanBlockBox as typeof Box;

export default SpanBlockBoxAsBox;
