const DESCRIPTION_PREFIX_REGEX = /^\d{2} \| /;
const DESCRIPTION_MAX_LENGTH = 200;

/** Max characters the user can type for a description. */
export const USER_DESCRIPTION_MAX_LENGTH = 150;

/**
 * Builds the full description with numbering prefix.
 *
 * @param index 0-based index
 * @param caption user-entered caption (may be empty)
 * @returns formatted description, e.g. "01 | Before repair" or "01"
 */
export const buildDescription = (index: number, caption: string): string => {
  const prefix = String(index + 1).padStart(2, "0");
  const trimmed = caption.trim();
  if (trimmed.length === 0) {
    return prefix;
  }
  const full = `${prefix} | ${trimmed}`;
  return full.substring(0, DESCRIPTION_MAX_LENGTH);
};

/**
 * Extracts the user-visible caption from a description, stripping the
 * `01 | ` prefix if present.
 */
export const extractCaption = (description: string | null): string => {
  if (!description) {
    return "";
  }
  // Strip "01 | " prefix or standalone "01" (number-only, no user text)
  const stripped = description
    .replace(DESCRIPTION_PREFIX_REGEX, "")
    .replace(/^\d{2}$/, "")
    .trim();
  return stripped;
};

/**
 * Returns the sort key from a description (the numeric prefix).
 * Falls back to the full description for lexicographic sorting.
 */
export const getDescriptionSortKey = (description: string | null): string =>
  description ?? "";
