import MailOutlineIcon from "@mui/icons-material/MailOutline";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import { mailtoHref } from "@/utils/utils";

type Props = {
  subject: string;
  plainTextBody: string;
  htmlBody: string;
};

const ShareViaEmailIconButton = ({
  subject,
  plainTextBody,
  htmlBody,
}: Props) => {
  const handleClick = () => {
    window.location.href = mailtoHref({
      subject,
      plainTextBody,
      htmlBody,
    });
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
