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
      <IconButton color="primary" sx={{ p: 0 }} onClick={handleClick}>
        <MailOutlineIcon sx={{ fontSize: 36 }} />
      </IconButton>
    </Tooltip>
  );
};

export default ShareViaEmailIconButton;
