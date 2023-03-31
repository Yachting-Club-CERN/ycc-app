import Typography from '@mui/material/Typography';
import {styled} from '@mui/material/styles';

/**
 * A Typography component with default spacing.
 *
 * This is preferred over global styles, as the latter would affect all components including Typography components (such as ListItemText or DataGrid).
 */
const SpacedTypography = styled(Typography)({
  '&': {
    marginTop: '1rem',
    marginBottom: '1rem',
    textAlign: 'justify',
  },
}) as typeof Typography;

export default SpacedTypography;
