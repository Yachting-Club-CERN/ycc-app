export const isDesktop = () => {
  const platform = navigator.userAgentData?.platform ?? navigator.userAgent;

  return /Win|Mac|Linux/i.test(platform);
};

type MailtoHrefPropsCommon = {
  to?: string;
  subject?: string;
};

type MailtoHrefPropsWithBody = MailtoHrefPropsCommon & {
  // For mobile
  plainTextBody: string;
  // For desktop, as \n is not correctly supported by all email clients
  htmlBody: string;
};

type MailtoHrefPropsWithoutBody = MailtoHrefPropsCommon & {
  plainTextBody?: never;
  htmlBody?: never;
};

/**
 * Generates a `mailto:` link with optional subject and body content.
 *
 * Uses `htmlBody` on desktop if available and `plainTextBody` on mobile.
 */
export const mailtoHref = ({
  to,
  subject,
  plainTextBody,
  htmlBody,
}: MailtoHrefPropsWithBody | MailtoHrefPropsWithoutBody) => {
  const params = [];
  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }

  const body = isDesktop()
    ? (htmlBody ?? plainTextBody)
    : (plainTextBody ?? htmlBody);

  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  return params.length > 0
    ? `mailto:${to ?? ""}?${params.join("&")}`
    : `mailto:${to ?? ""}`;
};
