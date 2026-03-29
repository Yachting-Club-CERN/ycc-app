import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, test } from "vitest";

import getErrorText from "@/utils/error-helper";

const check = (error: unknown, expected: string): void => {
  expect(getErrorText(error)).toEqual(expected);
};

test("Non-error types", () => {
  check("Some string error", "Some string error");

  check(undefined, "<undefined>");
  check(null, "<null>");
  check(true, "true");
  check(0, "0");
  check(1, "1");
  check(Number.NaN, "NaN");
  check(-Infinity, "-Infinity");
  check(Infinity, "Infinity");
  check(BigInt(123), "123");
  check(Symbol("sym"), "Symbol(sym)");

  check(
    [1, "b"],
    `[
  1,
  "b"
]`,
  );

  check(
    () => false,
    `{
  "$specialValue": "() => false"
}`,
  );

  check(
    { a: "b" },
    `{
  "a": "b"
}`,
  );
});

test("Error", () => {
  check(new Error("Error 1"), "Error: Error 1");

  check(
    new Error("Error 2", {
      cause: new Error("Cause 2", { cause: "Root cause" }),
    }),
    "Error: Error 2\nCaused by: Error: Cause 2\nCaused by: Root cause",
  );
});

test("AxiosError", () => {
  check(
    new AxiosError("Axios error 1"),
    "AxiosError: Axios error 1 [undefined]",
  );

  check(
    new AxiosError("Axios error 2", "400"),
    "AxiosError: Axios error 2 [400]",
  );

  check(
    new AxiosError("Axios error 3", "400", undefined, undefined, {
      data: {
        detail: "Detailed reason",
      },
      status: 400,
      statusText: "UNUSED",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    }),
    "Detailed reason\n\n(AxiosError: Axios error 3 [400])",
  );

  check(
    new AxiosError("Axios error 4", "400", undefined, undefined, {
      data: {
        detail: [{ msg: "Error 1" }, { msg: "Error 2", ignored: "field" }],
      },
      status: 400,
      statusText: "UNUSED",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    }),
    `Error 1, Error 2

[
  {
    "msg": "Error 1"
  },
  {
    "msg": "Error 2",
    "ignored": "field"
  }
]

(AxiosError: Axios error 4 [400])`,
  );
});

describe("AxiosError detail with non-object elements", () => {
  test("detail array with string element (no msg property)", () => {
    check(
      new AxiosError("Axios error 5", "400", undefined, undefined, {
        data: {
          detail: ["plain string", { msg: "Error 1" }],
        },
        status: 400,
        statusText: "UNUSED",
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }),
      `Error 1

[
  "plain string",
  {
    "msg": "Error 1"
  }
]

(AxiosError: Axios error 5 [400])`,
    );
  });
});

describe("Error wrapping AxiosError as cause", () => {
  test.each([401, 403, 404, 409])(
    "HTTP %d with string detail returns detail directly",
    (status) => {
      const axiosError = new AxiosError(
        "Request failed",
        String(status),
        undefined,
        undefined,
        {
          data: { detail: "Access denied" },
          status,
          statusText: "UNUSED",
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
        },
      );
      const wrappedError = new Error("Something went wrong", {
        cause: axiosError,
      });
      check(wrappedError, "Access denied");
    },
  );

  test("HTTP 401 with non-string detail does not short-circuit", () => {
    const axiosError = new AxiosError(
      "Request failed",
      "401",
      undefined,
      undefined,
      {
        data: { detail: { complex: "object" } },
        status: 401,
        statusText: "UNUSED",
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      },
    );
    const wrappedError = new Error("Something went wrong", {
      cause: axiosError,
    });
    const result = getErrorText(wrappedError);
    expect(result).toBe(
      'Error: Something went wrong\nCaused by: {\n  "complex": "object"\n}\n\n(AxiosError: Request failed [401])',
    );
  });

  test("HTTP 500 with string detail does not short-circuit", () => {
    const axiosError = new AxiosError(
      "Request failed",
      "500",
      undefined,
      undefined,
      {
        data: { detail: "Internal error" },
        status: 500,
        statusText: "UNUSED",
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      },
    );
    const wrappedError = new Error("Something went wrong", {
      cause: axiosError,
    });
    const result = getErrorText(wrappedError);
    expect(result).toBe(
      "Error: Something went wrong\n" +
        "Caused by: Internal error\n\n(AxiosError: Request failed [500])",
    );
  });
});
