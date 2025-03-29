import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

type Props = {
  message: string;
};

const ShareViaWhatsAppIconButton = ({ message }: Props) => {
  const handleClick = () => {
    window.location.href = `whatsapp://send?text=${encodeURIComponent(message)}`;
  };

  return (
    <Tooltip title="Share via WhatsApp">
      <IconButton color="success" onClick={handleClick}>
        <WhatsAppIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ShareViaWhatsAppIconButton;
