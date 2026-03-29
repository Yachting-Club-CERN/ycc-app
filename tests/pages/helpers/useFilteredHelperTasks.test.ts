import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { makeMember, makeTask } from "@tests/factories";

import { User } from "@/context/auth/AuthenticationContext";
import { HelperTask, HelperTaskState } from "@/model/helpers-dtos";
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

const futureStart = dayjs.tz("2099-06-15 08:00:00", "Europe/Zurich");
const futureEnd = dayjs.tz("2099-06-15 16:00:00", "Europe/Zurich");
const pastStart = dayjs.tz("2020-06-15 08:00:00", "Europe/Zurich");
const pastEnd = dayjs.tz("2020-06-15 16:00:00", "Europe/Zurich");

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
    mockTasks = [
      makeTask({ id: 1, startsAt: futureStart, endsAt: futureEnd }),
      makeTask({ id: 2, startsAt: futureStart, endsAt: futureEnd }),
    ];
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
          startsAt: futureStart,
          endsAt: futureEnd,
          category: {
            id: 1,
            title: "Maintenance",
            shortDescription: "",
            longDescription: null,
          },
        }),
        makeTask({
          id: 2,
          startsAt: futureStart,
          endsAt: futureEnd,
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
          startsAt: futureStart,
          endsAt: futureEnd,
          contact: makeMember({
            firstName: "Tim",
            lastName: "Morgan",
            username: "TMORGAN",
          }),
        }),
        makeTask({ id: 2, startsAt: futureStart, endsAt: futureEnd }),
      ];
      const hook = await renderAndWait({ year: 2099, search: "Tim" });

      expect(hook.result.current.result).toHaveLength(1);
      expect(hook.result.current.result![0].id).toBe(1);
    });

    test("multi-token search uses AND logic", async () => {
      mockTasks = [
        makeTask({
          id: 1,
          startsAt: futureStart,
          endsAt: futureEnd,
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
          startsAt: futureStart,
          endsAt: futureEnd,
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
      mockTasks = [
        makeTask({ id: 1, startsAt: futureStart, endsAt: futureEnd }),
      ];
      const hook = await renderAndWait({
        year: 2099,
        search: "Maintenance Nonexistent",
      });

      expect(hook.result.current.result).toHaveLength(0);
    });

    test("empty search returns all", async () => {
      mockTasks = [
        makeTask({ id: 1, startsAt: futureStart, endsAt: futureEnd }),
        makeTask({ id: 2, startsAt: futureStart, endsAt: futureEnd }),
      ];
      const hook = await renderAndWait({ year: 2099, search: "   " });

      expect(hook.result.current.result).toHaveLength(2);
    });

    test("searches captain member", async () => {
      mockTasks = [
        makeTask({
          id: 1,
          startsAt: futureStart,
          endsAt: futureEnd,
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
          startsAt: futureStart,
          endsAt: futureEnd,
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
        makeTask({
          id: 1,
          startsAt: futureStart,
          endsAt: futureEnd,
          contact: makeMember({ username: "JDOE" }),
        }),
        makeTask({
          id: 2,
          startsAt: futureStart,
          endsAt: futureEnd,
          contact: makeMember({ username: "OTHER" }),
        }),
        makeTask({
          id: 3,
          startsAt: futureStart,
          endsAt: futureEnd,
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
        makeTask({
          id: 1,
          startsAt: futureStart,
          endsAt: futureEnd,
          helperMaxCount: 3,
        }),
        // Cannot: user is already captain
        makeTask({
          id: 2,
          startsAt: futureStart,
          endsAt: futureEnd,
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
        makeTask({
          id: 1,
          startsAt: futureStart,
          endsAt: futureEnd,
          published: true,
        }),
        makeTask({
          id: 2,
          startsAt: futureStart,
          endsAt: futureEnd,
          published: false,
        }),
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
        makeTask({ id: 1, startsAt: futureStart, endsAt: futureEnd }),
        makeTask({
          id: 2,
          startsAt: futureStart,
          endsAt: futureEnd,
          markedAsDoneAt: dayjs(),
        }),
        makeTask({
          id: 3,
          startsAt: futureStart,
          endsAt: futureEnd,
          validatedAt: dayjs(),
        }),
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
          startsAt: futureStart,
          endsAt: futureEnd,
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
          startsAt: futureStart,
          endsAt: futureEnd,
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
          startsAt: futureStart,
          endsAt: futureEnd,
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
