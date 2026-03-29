import { describe, expect, test } from "vitest";

import { statsSortByDate } from "@/pages/admin/statistics/statistics-utils";
import dayjs from "@/utils/dayjs";

const d = (s: string): dayjs.Dayjs => dayjs.tz(s, "Europe/Zurich");

type Sortable = { startsAt: dayjs.Dayjs | null; deadline: dayjs.Dayjs | null };

const sort = (items: Sortable[]): Sortable[] =>
  [...items].sort(statsSortByDate);

describe("statsSortByDate", () => {
  test("sorts by startsAt ascending", () => {
    const a = { startsAt: d("2025-06-15 08:00"), deadline: null };
    const b = { startsAt: d("2025-06-14 08:00"), deadline: null };
    const c = { startsAt: d("2025-06-16 08:00"), deadline: null };
    expect(sort([a, b, c])).toEqual([b, a, c]);
  });

  test("sorts by deadline when no startsAt", () => {
    const a = { startsAt: null, deadline: d("2025-07-01 20:00") };
    const b = { startsAt: null, deadline: d("2025-06-01 20:00") };
    expect(sort([a, b])).toEqual([b, a]);
  });

  test("startsAt takes precedence over deadline", () => {
    const a = {
      startsAt: d("2025-06-15 08:00"),
      deadline: d("2025-01-01 00:00"),
    };
    const b = { startsAt: d("2025-06-14 08:00"), deadline: null };
    expect(sort([a, b])).toEqual([b, a]);
  });

  test("both null dates are equal", () => {
    expect(
      statsSortByDate(
        { startsAt: null, deadline: null },
        { startsAt: null, deadline: null },
      ),
    ).toBe(0);
  });

  test("null date sorts after non-null", () => {
    const withDate = { startsAt: d("2025-06-15 08:00"), deadline: null };
    const withoutDate = { startsAt: null, deadline: null };
    expect(sort([withoutDate, withDate])).toEqual([withDate, withoutDate]);
  });

  test("first item null date sorts after second with date", () => {
    const a = { startsAt: null, deadline: null };
    const b = { startsAt: d("2025-06-15 08:00"), deadline: null };
    expect(statsSortByDate(a, b)).toBe(1);
  });
});
