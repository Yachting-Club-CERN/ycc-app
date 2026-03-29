import { describe, expect, test } from "vitest";

import {
  getHelperTaskState,
  getHelperTaskType,
  HelperTaskSchema,
  HelperTaskState,
  HelperTaskType,
} from "@/model/helpers-dtos";
import dayjs from "@/utils/dayjs";

describe("getHelperTaskType", () => {
  test("shift: startsAt + endsAt, no deadline", () => {
    expect(
      getHelperTaskType({
        startsAt: dayjs("2025-06-15T08:00:00"),
        endsAt: dayjs("2025-06-15T18:00:00"),
        deadline: null,
      }),
    ).toBe(HelperTaskType.Shift);
  });

  test("deadline: only deadline set", () => {
    expect(
      getHelperTaskType({
        startsAt: null,
        endsAt: null,
        deadline: dayjs("2025-06-15"),
      }),
    ).toBe(HelperTaskType.Deadline);
  });

  test("unknown: all set", () => {
    expect(
      getHelperTaskType({
        startsAt: dayjs("2025-06-15T08:00:00"),
        endsAt: dayjs("2025-06-15T18:00:00"),
        deadline: dayjs("2025-06-15"),
      }),
    ).toBe(HelperTaskType.Unknown);
  });

  test("unknown: none set", () => {
    expect(
      getHelperTaskType({ startsAt: null, endsAt: null, deadline: null }),
    ).toBe(HelperTaskType.Unknown);
  });
});

describe("getHelperTaskState", () => {
  test("validated", () => {
    expect(
      getHelperTaskState({
        validatedAt: dayjs("2025-06-15"),
        markedAsDoneAt: dayjs("2025-06-14"),
      }),
    ).toBe(HelperTaskState.Validated);
  });

  test("done", () => {
    expect(
      getHelperTaskState({
        validatedAt: null,
        markedAsDoneAt: dayjs("2025-06-14"),
      }),
    ).toBe(HelperTaskState.Done);
  });

  test("pending", () => {
    expect(
      getHelperTaskState({ validatedAt: null, markedAsDoneAt: null }),
    ).toBe(HelperTaskState.Pending);
  });
});

const makeMemberRaw = (overrides = {}): Record<string, unknown> => ({
  id: 1,
  username: "JDOE",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  mobilePhone: null,
  homePhone: null,
  workPhone: null,
  ...overrides,
});

const makeCategoryRaw = (): Record<string, unknown> => ({
  id: 1,
  title: "Surveillance",
  shortDescription: "Watch",
  longDescription: null,
});

const makeTaskRaw = (overrides = {}): Record<string, unknown> => ({
  id: 1,
  category: makeCategoryRaw(),
  title: "Test Task",
  shortDescription: "A test",
  longDescription: null,
  contact: makeMemberRaw(),
  startsAt: "2025-06-15T08:00:00",
  endsAt: "2025-06-15T18:00:00",
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
  ...overrides,
});

describe("HelperTaskSchema transform", () => {
  test("shift task has correct type", () => {
    const task = HelperTaskSchema.parse(makeTaskRaw());
    expect(task.type).toBe(HelperTaskType.Shift);
  });

  test("deadline task has correct type", () => {
    const task = HelperTaskSchema.parse(
      makeTaskRaw({ startsAt: null, endsAt: null, deadline: "2025-06-15" }),
    );
    expect(task.type).toBe(HelperTaskType.Deadline);
  });

  test("pending task has correct state", () => {
    const task = HelperTaskSchema.parse(makeTaskRaw());
    expect(task.state).toBe(HelperTaskState.Pending);
  });

  test("done task has correct state", () => {
    const task = HelperTaskSchema.parse(
      makeTaskRaw({ markedAsDoneAt: "2025-06-15T12:00:00" }),
    );
    expect(task.state).toBe(HelperTaskState.Done);
  });

  test("validated task has correct state", () => {
    const task = HelperTaskSchema.parse(
      makeTaskRaw({ validatedAt: "2025-06-15T14:00:00" }),
    );
    expect(task.state).toBe(HelperTaskState.Validated);
  });

  test("searchString includes formatted dates", () => {
    const task = HelperTaskSchema.parse(makeTaskRaw());
    expect(task.searchString).toBe(
      "15/06/2025 Sunday, 15 June 2025 15/06/2025 Sunday, 15 June 2025",
    );
  });

  test("searchString is cached on second access", () => {
    const task = HelperTaskSchema.parse(makeTaskRaw());
    const first = task.searchString;
    const second = task.searchString;
    expect(first).toBe(second);
  });

  test("searchString is empty when no dates", () => {
    const task = HelperTaskSchema.parse(
      makeTaskRaw({ startsAt: null, endsAt: null, deadline: null }),
    );
    expect(task.searchString).toBe("");
  });

  test("dates are parsed as dayjs instances", () => {
    const task = HelperTaskSchema.parse(makeTaskRaw());
    expect(dayjs.isDayjs(task.startsAt)).toBe(true);
    expect(dayjs.isDayjs(task.endsAt)).toBe(true);
  });
});
