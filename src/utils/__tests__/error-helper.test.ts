import { AxiosError, AxiosHeaders } from "axios";
import { test, expect } from "vitest";

import getErrorText from "../error-helper";

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
  check(NaN, "NaN");
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
    Error("Error 2", { cause: Error("Cause 2", { cause: "Root cause" }) }),
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
