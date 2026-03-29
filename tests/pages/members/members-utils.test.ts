import { describe, expect, test } from "vitest";

import { MemberPublicInfo } from "@/model/dtos";
import {
  getFullName,
  getFullNameAndUsername,
} from "@/pages/members/members-utils";

const makeMember = (
  overrides: Partial<MemberPublicInfo> = {},
): MemberPublicInfo => ({
  id: 42,
  username: "HCHANG",
  firstName: "Heather",
  lastName: "Chang",
  email: "heather@example.com",
  mobilePhone: null,
  homePhone: null,
  workPhone: null,
  ...overrides,
});

describe("getFullName", () => {
  test.each([
    ["mixed case", "Chang", "Heather CHANG"],
    ["already upper", "DOE", "Heather DOE"],
    ["lowercase", "doe", "Heather DOE"],
  ])("last name %s: '%s' -> '%s'", (_desc, lastName, expected) => {
    expect(getFullName(makeMember({ lastName }))).toBe(expected);
  });
});

describe("getFullNameAndUsername", () => {
  test("formats full name with username in parens", () => {
    expect(getFullNameAndUsername(makeMember())).toBe("Heather CHANG (HCHANG)");
  });
});
