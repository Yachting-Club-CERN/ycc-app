import { describe, expect, test } from "vitest";
import * as z from "zod";

import { zodTransformDate } from "@/model/dtos";
import dayjs from "@/utils/dayjs";

// Helper to run zodTransformDate through a Zod schema
const DateSchema = z.unknown().transform(zodTransformDate);

describe("zodTransformDate", () => {
  test("valid date string returns dayjs instance", () => {
    const result = DateSchema.parse("2025-06-15T10:00:00");
    expect(dayjs.isDayjs(result)).toBe(true);
    expect(result.isValid()).toBe(true);
    expect(result.format("YYYY-MM-DD")).toBe("2025-06-15");
  });

  test("dayjs instance passes through", () => {
    const input = dayjs("2025-06-15");
    const result = DateSchema.parse(input);
    expect(dayjs.isDayjs(result)).toBe(true);
    expect(result.isSame(input)).toBe(true);
  });

  test("invalid string fails", () => {
    expect(() => DateSchema.parse("not-a-date")).toThrow();
  });

  test("non-string non-dayjs value fails", () => {
    expect(() => DateSchema.parse(12345)).toThrow();
  });

  test("null fails", () => {
    expect(() => DateSchema.parse(null)).toThrow();
  });
});
