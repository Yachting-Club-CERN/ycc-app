import { AxiosError } from "axios";

import toJson from "./toJson";

const getErrorDetail = (error: AxiosError) => {
  const data: unknown = error.response?.data;

  if (data !== null && typeof data === "object") {
    return (data as Record<string, unknown>)?.detail;
  } else {
    return undefined;
  }
};

const getErrorDetailMsg = (detail: unknown) => {
  if (detail !== null && typeof detail === "object") {
    return (detail as Record<string, unknown>)?.msg;
  } else {
    return undefined;
  }
};

const getText = (value: unknown) => {
  if (value === undefined) {
    return "<undefined>";
  } else if (value === null) {
    return "<null>";
  } else if (typeof value === "function" || typeof value === "object") {
    return toJson(value);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return value.toString();
  }
};

/**
 * Gets error as string. If the error is an AxiosError, the detail will be included in the string.
 *
 * @param error an error
 * @returns string representation
 */
const getErrorAsString = (error: Error): string => {
  if (error instanceof AxiosError) {
    const message = `${error.name}: ${error.message} [${error.code}]`;
    const detail: unknown = getErrorDetail(error);

    let detailStr = "";
    if (Array.isArray(detail)) {
      detailStr +=
        detail
          .map(getErrorDetailMsg)
          .filter((msg) => msg)
          .map(getText)
          .join(", ") + "\n\n";
    }

    if (detail) {
      detailStr += `${getText(detail)}`;
    }

    if (detailStr) {
      return `${detailStr}\n\n(${message})`;
    } else {
      return message;
    }
  } else {
    return error.toString();
  }
};

/**
 * Extracts the chain of an error as a string array. The cause will string with the top-level error.
 *
 * @param error an error
 * @returns array of error chain
 */
export const getErrorChainAsStrings = (error: Error) => {
  const chain: string[] = [];
  chain.push(getErrorAsString(error));

  let curr: unknown = error.cause;
  while (curr !== null && curr !== undefined) {
    if (curr instanceof Error) {
      chain.push(`Caused by: ${getErrorAsString(curr)}`);
      curr = curr.cause;
    } else {
      chain.push(`Caused by: ${getText(curr)}`);
      curr = null;
    }
  }

  return chain;
};

/**
 * Extracts the cause chain of an error. The cause chain will not contain the top-level error.
 *
 * @param error an error
 * @returns array of error cause chain
 */
export const getErrorCauseChain = (error: Error) => {
  const chain: unknown[] = [];

  let curr: unknown = error.cause;
  while (curr !== null && curr !== undefined) {
    if (curr instanceof Error) {
      chain.push(getErrorAsString(curr));
      curr = curr.cause;
    } else {
      chain.push(curr);
      curr = null;
    }
  }

  return chain;
};

/**
 * Extracts the text representation for an error.
 *
 * For straightforward errors, the text representation is the error message.
 *
 * @param error an error
 * @returns error text
 */
export const getErrorText = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.cause instanceof AxiosError) {
      const cause = error.cause as AxiosError;
      const status = cause.response?.status;
      const errorDetail = getErrorDetail(cause);

      if (
        status &&
        [401, 403, 404, 409].includes(status) &&
        errorDetail &&
        typeof errorDetail === "string"
      ) {
        return errorDetail;
      }
    }

    return getErrorChainAsStrings(error).join("\n");
  } else {
    return getText(error);
  }
};

export default getErrorText;
