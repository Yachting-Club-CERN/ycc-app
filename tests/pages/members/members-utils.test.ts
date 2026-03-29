import { describe, expect, test } from "vitest";

import { makeMember } from "@tests/factories";

import {
  getFullName,
  getFullNameAndUsername,
} from "@/pages/members/members-utils";

describe("getFullName", () => {
  test.each([
    ["mixed case", "Chang", "Heather CHANG"],
    ["already upper", "DOE", "Heather DOE"],
    ["lowercase", "doe", "Heather DOE"],
  ])("last name %s: '%s' -> '%s'", (_desc, lastName, expected) => {
    expect(getFullName(makeMember({ firstName: "Heather", lastName }))).toBe(
      expected,
    );
  });
});

describe("getFullNameAndUsername", () => {
  test("formats full name with username in parens", () => {
    expect(
      getFullNameAndUsername(
        makeMember({
          username: "HCHANG",
          firstName: "Heather",
          lastName: "Chang",
        }),
      ),
    ).toBe("Heather CHANG (HCHANG)");
  });
});
