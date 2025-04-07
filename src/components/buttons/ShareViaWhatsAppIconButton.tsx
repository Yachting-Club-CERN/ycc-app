import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

type Props = {
  message: string;
};

const ShareViaWhatsAppIconButton: React.FC<Props> = ({ message }) => {
  const handleClick = (): void => {
    window.location.href = `whatsapp://send?text=${encodeURIComponent(message)}`;
  };

  return (
    <Tooltip title="Share via WhatsApp">
      <IconButton color="success" sx={{ p: 0 }} onClick={handleClick}>
        <WhatsAppIcon sx={{ fontSize: 36 }} />
      </IconButton>
    </Tooltip>
  );
};

export default ShareViaWhatsAppIconButton;
