import Link from "@mui/material/Link";

export const toEmailLink = (value?: string | null) => {
  return value ? (
    <Link href={`mailto:${value}`} target="_blank" rel="noopener">
      {value}
    </Link>
  ) : null;
};

export const toTelLink = (value?: string | null) => {
  return value ? (
    <Link href={`tel:${value}`} target="_blank" rel="noopener">
      {value}
    </Link>
  ) : null;
};
