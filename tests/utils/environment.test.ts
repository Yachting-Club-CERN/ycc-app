import { describe, expect, test } from "vitest";

import { Environment, parseEnvironment } from "@/environment";

describe("parseEnvironment", () => {
  test.each([
    ["PRODUCTION", Environment.PRODUCTION],
    ["TEST", Environment.TEST],
    ["DEVELOPMENT", Environment.DEVELOPMENT],
    ["LOCAL", Environment.LOCAL],
  ])("parses '%s'", (input, expected) => {
    expect(parseEnvironment(input)).toBe(expected);
  });

  test.each(["production", "Production", "local", "UNKNOWN", "", "  LOCAL  "])(
    "returns undefined for invalid value '%s'",
    (input) => {
      expect(parseEnvironment(input)).toBeUndefined();
    },
  );

  test("returns undefined for undefined", () => {
    expect(parseEnvironment(undefined)).toBeUndefined();
  });
});
