import Link from "@mui/material/Link";

import { mailtoHref } from "@/utils/utils";

type Props = {
  email?: string | null | undefined;
};

const EmailLink = ({ email }: Props): React.ReactNode => {
  if (!email) {
    return null;
  }

  return (
    <Link href={mailtoHref({ to: email })} target="_blank" rel="noopener">
      {email}
    </Link>
  );
};

export default EmailLink;
