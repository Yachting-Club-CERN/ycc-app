import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { User } from "@/context/auth/AuthenticationContext";
import { MemberPublicInfo } from "@/model/dtos";
import {
  HelperTask,
  HelperTaskState,
  HelperTaskType,
} from "@/model/helpers-dtos";
import { useFilteredHelperTasks } from "@/pages/helpers/useFilteredHelperTasks";
import dayjs from "@/utils/dayjs";

const mockUser = new User(
  "f:uuid:42",
  42,
  "JDOE",
  "john@example.com",
  "John",
  "Doe",
  [],
  ["ycc-member-active"],
);

vi.mock("@/context/auth/useCurrentUser", () => ({
  default: (): User => mockUser,
}));

let mockTasks: HelperTask[] = [];

vi.mock("@/utils/client", () => ({
  default: {
    helpers: {
      getTasks: async (): Promise<HelperTask[]> => mockTasks,
    },
  },
}));

const makeMember = (
  overrides: Partial<MemberPublicInfo> = {},
): MemberPublicInfo => ({
  id: 1,
  username: "ASMITH",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  mobilePhone: null,
  homePhone: null,
  workPhone: null,
  ...overrides,
});

const futureStart = dayjs.tz("2099-06-15 08:00:00", "Europe/Zurich");
const futureEnd = dayjs.tz("2099-06-15 16:00:00", "Europe/Zurich");
const pastStart = dayjs.tz("2020-06-15 08:00:00", "Europe/Zurich");
const pastEnd = dayjs.tz("2020-06-15 16:00:00", "Europe/Zurich");

const makeTask = (overrides: Partial<HelperTask> = {}): HelperTask => {
  const defaults = {
    id: 1,
    category: {
      id: 1,
      title: "Maintenance",
      shortDescription: "",
      longDescription: null,
    },
    title: "Fix jib",
    shortDescription: "Fix the jib on J80",
    longDescription: null,
    contact: makeMember(),
    startsAt: futureStart,
    endsAt: futureEnd,
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

const renderAndWait = async (
  options: Parameters<typeof useFilteredHelperTasks>[0],
): Promise<
  ReturnType<
    typeof renderHook<ReturnType<typeof useFilteredHelperTasks>, unknown>
  >
> => {
  let hook: ReturnType<
    typeof renderHook<ReturnType<typeof useFilteredHelperTasks>, unknown>
  >;
  await act(async () => {
    hook = renderHook(() => useFilteredHelperTasks(options));
  });
  return hook!;
};

describe("useFilteredHelperTasks", () => {
  test("returns all tasks with no filters", async () => {
    mockTasks = [makeTask({ id: 1 }), makeTask({ id: 2 })];
    const hook = await renderAndWait({ year: 2099 });

    expect(hook.result.current.result).toHaveLength(2);
  });

  test("passes null to client when year is ALL_YEARS", async () => {
    mockTasks = [makeTask({ id: 1 })];
    const hook = await renderAndWait({ year: "ALL" });

    expect(hook.result.current.result).toHaveLength(1);
  });

  describe("search", () => {
    test("filters by category title", async () => {
      mockTasks = [
        makeTask({
          id: 1,
          category: {
            id: 1,
            title: "Maintenance",
            shortDescription: "",
            longDescription: null,
          },
        }),
        makeTask({
          id: 2,
          category: {
            id: 2,
            title: "Cleaning",
            shortDescription: "",
            longDescription: null,
          },
        }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        search: "maintenance",
      });

      expect(hook.result.current.result).toHaveLength(1);
      expect(hook.result.current.result![0].id).toBe(1);
    });

    test("filters by contact name", async () => {
      mockTasks = [
        makeTask({
          id: 1,
          contact: makeMember({
            firstName: "Tim",
            lastName: "Morgan",
            username: "TMORGAN",
          }),
        }),
        makeTask({ id: 2 }),
      ];
      const hook = await renderAndWait({ year: 2099, search: "Tim" });

      expect(hook.result.current.result).toHaveLength(1);
      expect(hook.result.current.result![0].id).toBe(1);
    });

    test("multi-token search uses AND logic", async () => {
      mockTasks = [
        makeTask({
          id: 1,
          category: {
            id: 1,
            title: "Racing",
            shortDescription: "",
            longDescription: null,
          },
          contact: makeMember({
            firstName: "Tim",
            lastName: "Morgan",
            username: "TMORGAN",
          }),
        }),
        makeTask({
          id: 2,
          category: {
            id: 2,
            title: "Maintenance",
            shortDescription: "",
            longDescription: null,
          },
        }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        search: "Racing Tim",
      });

      expect(hook.result.current.result).toHaveLength(1);
      expect(hook.result.current.result![0].id).toBe(1);
    });

    test("returns empty when not all tokens match", async () => {
      mockTasks = [makeTask({ id: 1 })];
      const hook = await renderAndWait({
        year: 2099,
        search: "Maintenance Nonexistent",
      });

      expect(hook.result.current.result).toHaveLength(0);
    });

    test("empty search returns all", async () => {
      mockTasks = [makeTask({ id: 1 }), makeTask({ id: 2 })];
      const hook = await renderAndWait({ year: 2099, search: "   " });

      expect(hook.result.current.result).toHaveLength(2);
    });

    test("searches captain member", async () => {
      mockTasks = [
        makeTask({
          id: 1,
          captain: {
            member: makeMember({
              username: "BCAPTAIN",
              firstName: "Bob",
              lastName: "Captain",
            }),
            signedUpAt: dayjs(),
          },
        }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        search: "BCAPTAIN",
      });

      expect(hook.result.current.result).toHaveLength(1);
    });

    test("searches helper members", async () => {
      mockTasks = [
        makeTask({
          id: 1,
          helpers: [
            {
              member: makeMember({
                username: "HELPER1",
                firstName: "Helper",
                lastName: "One",
              }),
              signedUpAt: dayjs(),
            },
          ],
        }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        search: "HELPER1",
      });

      expect(hook.result.current.result).toHaveLength(1);
    });
  });

  describe("flag filters", () => {
    test("showOnlyUpcoming filters past tasks", async () => {
      mockTasks = [
        makeTask({ id: 1, startsAt: futureStart, endsAt: futureEnd }),
        makeTask({ id: 2, startsAt: pastStart, endsAt: pastEnd }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        showOnlyUpcoming: true,
      });

      expect(hook.result.current.result).toHaveLength(1);
      expect(hook.result.current.result![0].id).toBe(1);
    });

    test("showOnlyContactOrSignedUp filters correctly", async () => {
      mockTasks = [
        makeTask({ id: 1, contact: makeMember({ username: "JDOE" }) }),
        makeTask({ id: 2, contact: makeMember({ username: "OTHER" }) }),
        makeTask({
          id: 3,
          contact: makeMember({ username: "OTHER" }),
          captain: {
            member: makeMember({ username: "JDOE" }),
            signedUpAt: dayjs(),
          },
        }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        showOnlyContactOrSignedUp: true,
      });

      expect(hook.result.current.result).toHaveLength(2);
      expect(hook.result.current.result!.map((t) => t.id)).toEqual([1, 3]);
    });

    test("showOnlyAvailable filters to tasks user can sign up for", async () => {
      mockTasks = [
        // Can sign up: upcoming, published, pending, has space, not signed up
        makeTask({ id: 1, helperMaxCount: 3 }),
        // Cannot: user is already captain
        makeTask({
          id: 2,
          captain: {
            member: makeMember({ username: "JDOE" }),
            signedUpAt: dayjs(),
          },
        }),
        // Cannot: past task
        makeTask({ id: 3, startsAt: pastStart, endsAt: pastEnd }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        showOnlyAvailable: true,
      });

      expect(hook.result.current.result).toHaveLength(1);
      expect(hook.result.current.result![0].id).toBe(1);
    });

    test("showOnlyUnpublished filters correctly", async () => {
      mockTasks = [
        makeTask({ id: 1, published: true }),
        makeTask({ id: 2, published: false }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        showOnlyUnpublished: true,
      });

      expect(hook.result.current.result).toHaveLength(1);
      expect(hook.result.current.result![0].id).toBe(2);
    });

    test("states filter matches specific states", async () => {
      mockTasks = [
        makeTask({ id: 1 }),
        makeTask({ id: 2, markedAsDoneAt: dayjs() }),
        makeTask({ id: 3, validatedAt: dayjs() }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        states: [HelperTaskState.Done, HelperTaskState.Validated],
      });

      expect(hook.result.current.result).toHaveLength(2);
      expect(hook.result.current.result!.map((t) => t.id)).toEqual([2, 3]);
    });
  });

  describe("combined filters", () => {
    test("search and flags are applied together", async () => {
      mockTasks = [
        makeTask({
          id: 1,
          category: {
            id: 1,
            title: "Maintenance",
            shortDescription: "",
            longDescription: null,
          },
          published: true,
        }),
        makeTask({
          id: 2,
          category: {
            id: 2,
            title: "Cleaning",
            shortDescription: "",
            longDescription: null,
          },
          published: false,
        }),
        makeTask({
          id: 3,
          category: {
            id: 1,
            title: "Maintenance",
            shortDescription: "",
            longDescription: null,
          },
          published: false,
        }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        search: "maintenance",
        showOnlyUnpublished: true,
      });

      expect(hook.result.current.result).toHaveLength(1);
      expect(hook.result.current.result![0].id).toBe(3);
    });
  });
});
