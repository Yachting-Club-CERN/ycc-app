import Link from "@mui/material/Link";

type Props = {
  phone?: string | null;
};

const PhoneLink = ({ phone }: Props) => {
  if (!phone) {
    return null;
  }

  return (
    <Link href={`tel:${phone}`} target="_blank" rel="noopener">
      {phone}
    </Link>
  );
};

export default PhoneLink;
