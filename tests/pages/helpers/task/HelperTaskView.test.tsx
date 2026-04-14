import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { makeMember, makeTask, makeUser } from "@tests/factories";

import useCurrentUser from "@/context/auth/useCurrentUser";
import HelperTaskView from "@/pages/helpers/task/HelperTaskView";

const adminUser = makeUser({
  username: "ADMIN",
  roles: ["ycc-member-active", "ycc-helpers-app-admin"],
});

const editorUser = makeUser({
  username: "EDITOR",
  roles: ["ycc-member-active", "ycc-helpers-app-editor"],
});

const regularUser = makeUser({
  username: "REGULAR",
  roles: ["ycc-member-active"],
});

vi.mock("@/context/auth/useCurrentUser", () => ({
  default: vi.fn(),
}));

const renderView = (
  task = makeTask(),
  refreshTask: () => void = vi.fn(),
): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <HelperTaskView task={task} refreshTask={refreshTask} />
    </MemoryRouter>,
  );

const openActionsMenu = async (): Promise<HTMLElement> => {
  await userEvent.click(screen.getByRole("button", { name: "Actions" }));
  return screen.getByRole("menu");
};

const getMenuItemLinkHrefs = (menu: HTMLElement): Record<string, string> => {
  const items = within(menu).getAllByRole("menuitem");
  return Object.fromEntries(
    items.map((item) => [item.textContent, item.getAttribute("href") ?? ""]),
  );
};

beforeEach(() => {
  vi.mocked(useCurrentUser).mockReset();
});

describe("HelperTaskView - actions visibility", () => {
  describe("regular user", () => {
    test("shows neither Actions menu nor New Task button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(regularUser);
      renderView();

      expect(
        screen.queryByRole("button", { name: "Actions" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /New Task/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("editor who is not the task contact", () => {
    test("shows New Task button only, no Actions menu, no Edit entry", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderView(task);

      expect(
        screen.queryByRole("button", { name: "Actions" }),
      ).not.toBeInTheDocument();

      const newTaskLinks = screen.getAllByRole("link", { name: /New Task/ });
      expect(newTaskLinks).toHaveLength(2); // Desktop + mobile
      for (const link of newTaskLinks) {
        expect(link.getAttribute("href")).toBe("/helpers/tasks/new");
      }

      expect(
        screen.queryByRole("link", { name: /Edit Task/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("menuitem", { name: /Edit Task/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("editor who is the task contact", () => {
    test("Actions menu opens with Edit/Clone/Clone to Multiple Dates/New Task, each linking correctly", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        id: 7386,
        contact: makeMember({ username: "EDITOR" }),
      });
      renderView(task);

      expect(
        screen.queryByRole("link", { name: /New Task/ }),
      ).not.toBeInTheDocument();

      const menu = await openActionsMenu();
      const items = within(menu).getAllByRole("menuitem");
      expect(items.map((i) => i.textContent)).toEqual([
        "Edit Task",
        "Clone Task",
        "Clone to Multiple Dates",
        "New Task",
      ]);

      const hrefs = getMenuItemLinkHrefs(menu);
      expect(hrefs["Edit Task"]).toBe("/helpers/tasks/7386/edit");
      expect(hrefs["Clone Task"]).toBe("/helpers/tasks/new?from=7386");
      expect(hrefs["New Task"]).toBe("/helpers/tasks/new");
      expect(hrefs["Clone to Multiple Dates"]).toBe(""); // Callback, not link
    });
  });

  describe("admin (edit rights on any task)", () => {
    test("Actions menu opens with all four entries even when not the contact", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      const task = makeTask({
        id: 42,
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderView(task);

      const menu = await openActionsMenu();
      const items = within(menu).getAllByRole("menuitem");
      expect(items.map((i) => i.textContent)).toEqual([
        "Edit Task",
        "Clone Task",
        "Clone to Multiple Dates",
        "New Task",
      ]);

      const hrefs = getMenuItemLinkHrefs(menu);
      expect(hrefs["Edit Task"]).toBe("/helpers/tasks/42/edit");
    });
  });
});

describe("HelperTaskView - task content rendering", () => {
  test("renders title, category, short description, and contact", () => {
    vi.mocked(useCurrentUser).mockReturnValue(regularUser);
    const task = makeTask({
      title: "Clean the clubhouse",
      shortDescription: "Sweep, mop, take out bins",
      category: {
        id: 9,
        title: "Maintenance",
        shortDescription: "",
        longDescription: null,
      },
      contact: makeMember({
        username: "JCAPTAIN",
        firstName: "Jane",
        lastName: "Captain",
      }),
    });
    renderView(task);

    // PageTitle renders twice (mobile + desktop variants) — assert exact count.
    expect(screen.getAllByText("Clean the clubhouse")).toHaveLength(2);
    expect(screen.getByText("Sweep, mop, take out bins")).toBeInTheDocument();
    expect(screen.getByText("Category: Maintenance")).toBeInTheDocument();
    expect(screen.getByText("Jane CAPTAIN (JCAPTAIN)")).toBeInTheDocument();
  });
});
