import MailOutlineIcon from "@mui/icons-material/MailOutline";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

type Props = {
  subject: string;
  body: string;
};

const ShareViaEmailIconButton = ({ subject, body }: Props) => {
  const handleClick = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Tooltip title="Share via Email">
      <IconButton color="primary" onClick={handleClick}>
        <MailOutlineIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ShareViaEmailIconButton;
