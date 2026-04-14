import { describe, expect, test } from "vitest";

import { makeCategory, makeTask } from "@tests/factories";

import {
  createTimingInfoLine,
  DONE_EMOJI,
  fakeRandomSignUpText,
  formatHelperTaskDocumentTitle,
  getStatusEmoji,
  VALIDATED_EMOJI,
} from "@/pages/helpers/helpers-format";
import dayjs from "@/utils/dayjs";

describe("formatHelperTaskDocumentTitle", () => {
  test.each([
    {
      name: "surveillance shift: appends start date",
      title: "Sailing Course",
      category: "Surveillance",
      startsAt: dayjs.tz("2026-04-14 10:00:00", "Europe/Zurich"),
      endsAt: dayjs.tz("2026-04-14 14:00:00", "Europe/Zurich"),
      deadline: null,
      expected: "Sailing Course (14 April 2026)",
    },
    {
      name: "surveillance deadline: appends 'by <date>'",
      title: "Annual Inspection",
      category: "Surveillance West",
      startsAt: null,
      endsAt: null,
      deadline: dayjs.tz("2026-09-30 23:59:00", "Europe/Zurich"),
      expected: "Annual Inspection (by 30 September 2026)",
    },
    {
      name: "surveillance with no dates: returns plain title",
      title: "Surveillance Setup",
      category: "Surveillance",
      startsAt: null,
      endsAt: null,
      deadline: null,
      expected: "Surveillance Setup",
    },
    {
      name: "non-surveillance task: returns plain title even with dates",
      title: "Spring Cleanup 2026",
      category: "Maintenance",
      startsAt: dayjs.tz("2026-04-14 10:00:00", "Europe/Zurich"),
      endsAt: dayjs.tz("2026-04-14 14:00:00", "Europe/Zurich"),
      deadline: null,
      expected: "Spring Cleanup 2026",
    },
  ])("$name", ({ title, category, startsAt, endsAt, deadline, expected }) => {
    const task = makeTask({
      title,
      category: makeCategory({ title: category }),
      startsAt,
      endsAt,
      deadline,
    });
    expect(formatHelperTaskDocumentTitle(task)).toBe(expected);
  });
});

describe("fakeRandomSignUpText", () => {
  test("returns a string from the texts array", () => {
    const result = fakeRandomSignUpText(1, false);
    expect(
      ["Sign me up!", "I am in!", "I will help!", "I will do it!"].includes(
        result,
      ),
    ).toBe(true);
  });

  test("is deterministic", () => {
    expect(fakeRandomSignUpText(42, true)).toBe(fakeRandomSignUpText(42, true));
    expect(fakeRandomSignUpText(42, false)).toBe(
      fakeRandomSignUpText(42, false),
    );
  });

  test("captain flag changes result", () => {
    // Not guaranteed to differ for every id, but should for most
    const results = new Set(
      Array.from({ length: 20 }, (_, i) => fakeRandomSignUpText(i, true)),
    );
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("getStatusEmoji", () => {
  test("validated task", () => {
    expect(getStatusEmoji(makeTask({ validatedAt: dayjs() }))).toBe(
      VALIDATED_EMOJI,
    );
  });

  test("done task", () => {
    expect(getStatusEmoji(makeTask({ markedAsDoneAt: dayjs() }))).toBe(
      DONE_EMOJI,
    );
  });

  test("pending task", () => {
    expect(getStatusEmoji(makeTask())).toBe("");
  });

  test("validated takes precedence over done", () => {
    expect(
      getStatusEmoji(
        makeTask({ validatedAt: dayjs(), markedAsDoneAt: dayjs() }),
      ),
    ).toBe(VALIDATED_EMOJI);
  });
});

describe("createTimingInfoLine", () => {
  test("same-day shift", () => {
    const result = createTimingInfoLine(makeTask());
    expect(result).toBe("Shift: Sunday, 15 June 2025 08:00 \u2013 18:00");
  });

  test("multi-day shift", () => {
    const task = makeTask({
      startsAt: dayjs.tz("2025-06-15 08:00:00", "Europe/Zurich"),
      endsAt: dayjs.tz("2025-06-17 16:00:00", "Europe/Zurich"),
    });
    const result = createTimingInfoLine(task);
    expect(result).toBe(
      "Multi-Day Shift: 15/06/2025 08:00 \u2013 17/06/2025 16:00",
    );
  });

  test("deadline task", () => {
    const task = makeTask({
      startsAt: null,
      endsAt: null,
      deadline: dayjs.tz("2025-07-01 20:00:00", "Europe/Zurich"),
    });
    const result = createTimingInfoLine(task);
    expect(result).toBe("Deadline: Tuesday, 1 July 2025 20:00");
  });

  test("unknown type (fallback)", () => {
    const task = makeTask({
      startsAt: dayjs.tz("2025-06-15 08:00:00", "Europe/Zurich"),
      endsAt: null,
      deadline: dayjs.tz("2025-07-01 20:00:00", "Europe/Zurich"),
    });
    const result = createTimingInfoLine(task);
    expect(result).toBe(
      "Start: 15/06/2025 08:00 End: - Deadline: 01/07/2025 20:00",
    );
  });

  test("unknown type with all null dates uses fallback dashes", () => {
    const task = makeTask({
      startsAt: null,
      endsAt: null,
      deadline: null,
    });
    const result = createTimingInfoLine(task);
    expect(result).toBe("Start: - End: - Deadline: -");
  });

  test("urgent prefix", () => {
    const result = createTimingInfoLine(makeTask({ urgent: true }));
    expect(result).toMatch(/^\(URGENT\) /);
  });

  test("hidden prefix", () => {
    const result = createTimingInfoLine(makeTask({ published: false }));
    expect(result).toMatch(/^\(HIDDEN\) /);
  });

  test("urgent + hidden prefix", () => {
    const result = createTimingInfoLine(
      makeTask({ urgent: true, published: false }),
    );
    expect(result).toMatch(/^\(URGENT, HIDDEN\) /);
  });

  test("done emoji in prefix", () => {
    const result = createTimingInfoLine(makeTask({ markedAsDoneAt: dayjs() }));
    expect(result).toBe(
      `${DONE_EMOJI} Shift: Sunday, 15 June 2025 08:00 \u2013 18:00`,
    );
  });

  test("validated emoji in prefix", () => {
    const result = createTimingInfoLine(makeTask({ validatedAt: dayjs() }));
    expect(result).toBe(
      `${VALIDATED_EMOJI} Shift: Sunday, 15 June 2025 08:00 \u2013 18:00`,
    );
  });
});
