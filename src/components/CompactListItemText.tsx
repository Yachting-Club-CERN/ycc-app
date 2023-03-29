import ListItemText from '@mui/material/ListItemText';
import {styled} from '@mui/material/styles';

const CompactListItemText = styled(ListItemText)({
  '& .MuiTypography-root': {
    margin: 0,
  },
});

export default CompactListItemText;
