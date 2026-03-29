import { describe, expect, test } from "vitest";

import { MemberPublicInfo } from "@/model/dtos";
import {
  HelperTask,
  HelperTaskState,
  HelperTaskType,
} from "@/model/helpers-dtos";
import {
  createTimingInfoLine,
  DONE_EMOJI,
  fakeRandomSignUpText,
  getStatusEmoji,
  VALIDATED_EMOJI,
} from "@/pages/helpers/helpers-format";
import dayjs from "@/utils/dayjs";

const makeMember = (): MemberPublicInfo => ({
  id: 1,
  username: "JDOE",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  mobilePhone: null,
  homePhone: null,
  workPhone: null,
});

const makeTask = (overrides: Partial<HelperTask> = {}): HelperTask => {
  const defaults = {
    id: 1,
    category: {
      id: 1,
      title: "Cat",
      shortDescription: "",
      longDescription: null,
    },
    title: "Task",
    shortDescription: "",
    longDescription: null,
    contact: makeMember(),
    startsAt: dayjs.tz("2025-06-15 08:00:00", "Europe/Zurich"),
    endsAt: dayjs.tz("2025-06-15 16:00:00", "Europe/Zurich"),
    deadline: null,
    urgent: false,
    captainRequiredLicenceInfo: null,
    helperMinCount: 1,
    helperMaxCount: 3,
    published: true,
    captain: null,
    helpers: [],
    markedAsDoneAt: null,
    markedAsDoneBy: null,
    markedAsDoneComment: null,
    validatedAt: null,
    validatedBy: null,
    validationComment: null,
  };
  const merged = { ...defaults, ...overrides };
  return {
    ...merged,
    get type(): HelperTaskType {
      if (merged.startsAt && merged.endsAt && !merged.deadline)
        return HelperTaskType.Shift;
      if (!merged.startsAt && !merged.endsAt && merged.deadline)
        return HelperTaskType.Deadline;
      return HelperTaskType.Unknown;
    },
    get state(): HelperTaskState {
      if (merged.validatedAt) return HelperTaskState.Validated;
      if (merged.markedAsDoneAt) return HelperTaskState.Done;
      return HelperTaskState.Pending;
    },
    get searchString(): string {
      return "";
    },
  };
};

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
    expect(result).toBe("Shift: Sunday, 15 June 2025 08:00 \u2013 16:00");
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
      `${DONE_EMOJI} Shift: Sunday, 15 June 2025 08:00 \u2013 16:00`,
    );
  });

  test("validated emoji in prefix", () => {
    const result = createTimingInfoLine(makeTask({ validatedAt: dayjs() }));
    expect(result).toBe(
      `${VALIDATED_EMOJI} Shift: Sunday, 15 June 2025 08:00 \u2013 16:00`,
    );
  });
});
