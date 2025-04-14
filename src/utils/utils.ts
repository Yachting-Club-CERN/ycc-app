type MailtoHrefProps = {
  to?: string;
  subject?: string;
  /**
   * Use plain text, as HTML is only supported by a limited number of desktop clients.
   */
  body?: string;
};

/**
 * Generates a `mailto:` link with optional subject and body content.
 */
export const mailtoHref = ({ to, subject, body }: MailtoHrefProps): string => {
  const params = [];
  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }
  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  console.log(`mailto:${to ?? ""}?${params.join("&")}`);

  return params.length > 0
    ? `mailto:${to ?? ""}?${params.join("&")}`
    : `mailto:${to ?? ""}`;
};
