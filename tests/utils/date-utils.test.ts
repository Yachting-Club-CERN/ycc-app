import { describe, expect, test } from "vitest";

import {
  formatDate,
  formatDateTime,
  formatDateTimeWithSeconds,
  formatDateWithDay,
  formatTime,
  getCurrentYear,
  getNow,
  isSameDay,
} from "@/utils/date-utils";
import dayjs from "@/utils/dayjs";

const date = dayjs.tz("2025-06-15 14:30:45", "Europe/Zurich");

describe("date formatting", () => {
  test.each([
    ["formatDate", formatDate, "15/06/2025"],
    ["formatDateWithDay", formatDateWithDay, "Sunday, 15 June 2025"],
    ["formatTime", formatTime, "14:30"],
    ["formatDateTime", formatDateTime, "15/06/2025 14:30"],
    [
      "formatDateTimeWithSeconds",
      formatDateTimeWithSeconds,
      "15/06/2025 14:30:45",
    ],
  ])("%s formats correctly", (_name, fn, expected) => {
    expect(fn(date)).toBe(expected);
  });

  test.each([
    ["formatDate", formatDate],
    ["formatDateWithDay", formatDateWithDay],
    ["formatTime", formatTime],
    ["formatDateTime", formatDateTime],
    ["formatDateTimeWithSeconds", formatDateTimeWithSeconds],
  ])("%s returns null for null", (_name, fn) => {
    expect(fn(null)).toBeNull();
  });

  test.each([
    ["formatDate", formatDate],
    ["formatDateWithDay", formatDateWithDay],
    ["formatTime", formatTime],
    ["formatDateTime", formatDateTime],
    ["formatDateTimeWithSeconds", formatDateTimeWithSeconds],
  ])("%s returns undefined for undefined", (_name, fn) => {
    expect(fn(undefined)).toBeUndefined();
  });

  test("formatDate accepts string input", () => {
    expect(formatDate("2025-01-01T00:00:00Z")).toBe("01/01/2025");
  });
});

describe("isSameDay", () => {
  test.each([
    ["same day, different times", "2025-06-15 08:00", "2025-06-15 23:59", true],
    ["different days", "2025-06-15 23:59", "2025-06-16 00:00", false],
    ["same midnight", "2025-06-15 00:00", "2025-06-15 00:00", true],
  ])("%s", (_desc, a, b, expected) => {
    expect(
      isSameDay(dayjs.tz(a, "Europe/Zurich"), dayjs.tz(b, "Europe/Zurich")),
    ).toBe(expected);
  });
});

describe("getCurrentYear", () => {
  test("returns a plausible year", () => {
    const year = getCurrentYear();
    expect(year).toBeGreaterThanOrEqual(2025);
    expect(year).toBeLessThanOrEqual(2100);
  });
});

describe("getNow", () => {
  test("returns a dayjs instance close to now", () => {
    const now = getNow();
    expect(dayjs.isDayjs(now)).toBe(true);
    expect(Math.abs(now.diff(dayjs(), "second"))).toBeLessThan(2);
  });
});
