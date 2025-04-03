import Link from "@mui/material/Link";

type Props = {
  email?: string | null;
};

const EmailLink = ({ email }: Props) => {
  if (!email) {
    return null;
  }

  return (
    <Link href={`mailto:${email}`} target="_blank" rel="noopener">
      {email}
    </Link>
  );
};

export default EmailLink;
