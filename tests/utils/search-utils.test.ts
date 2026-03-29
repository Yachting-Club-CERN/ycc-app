import { describe, expect, test } from "vitest";

import { makeMember } from "@tests/factories";

import dayjs from "@/utils/dayjs";
import {
  searchAnyStringProperty,
  searchMemberUsernameOrName,
  toDateSearchString,
} from "@/utils/search-utils";

const member = makeMember();

describe("searchAnyStringProperty", () => {
  test("matches a string property", () => {
    expect(searchAnyStringProperty("hello", { a: "hello world" })).toBe(true);
  });

  test("case insensitive", () => {
    expect(searchAnyStringProperty("HELLO", { a: "hello world" })).toBe(true);
  });

  test("trims search", () => {
    expect(searchAnyStringProperty("  hello  ", { a: "hello world" })).toBe(
      true,
    );
  });

  test("no match", () => {
    expect(searchAnyStringProperty("xyz", { a: "hello", b: "world" })).toBe(
      false,
    );
  });

  test("ignores non-string properties", () => {
    expect(searchAnyStringProperty("42", { a: 42, b: "other" })).toBe(false);
  });

  test("empty search matches everything", () => {
    expect(searchAnyStringProperty("", { a: "anything" })).toBe(true);
  });
});

describe("searchMemberUsernameOrName", () => {
  test("matches username", () => {
    expect(searchMemberUsernameOrName("jdoe", member)).toBe(true);
  });

  test("matches username case insensitive", () => {
    expect(searchMemberUsernameOrName("JDoe", member)).toBe(true);
  });

  test("matches first + last name", () => {
    expect(searchMemberUsernameOrName("john doe", member)).toBe(true);
  });

  test("matches last + first name", () => {
    expect(searchMemberUsernameOrName("doe john", member)).toBe(true);
  });

  test("partial match", () => {
    expect(searchMemberUsernameOrName("joh", member)).toBe(true);
  });

  test("no match", () => {
    expect(searchMemberUsernameOrName("alice", member)).toBe(false);
  });
});

describe("toDateSearchString", () => {
  test("null returns empty string", () => {
    expect(toDateSearchString(null)).toBe("");
  });

  test("formats a date for search", () => {
    const date = dayjs.tz("2025-06-15 14:30:00", "Europe/Zurich");
    const result = toDateSearchString(date);
    expect(result).toBe("15/06/2025 Sunday, 15 June 2025");
  });
});
