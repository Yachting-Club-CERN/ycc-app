import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { makeMember, makeTask, makeUser } from "@tests/factories";

import useCurrentUser from "@/context/auth/useCurrentUser";
import HelperTaskView from "@/pages/helpers/task/HelperTaskView";

vi.mock("@/context/auth/useCurrentUser", () => ({
  default: vi.fn(),
}));

vi.mock("@/pages/helpers/components/bulk-clone/useBulkCloneDialog", () => ({
  default: (): { component: null; open: () => void } => ({
    component: null,
    open: vi.fn(),
  }),
}));

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

const renderView = (
  ...args: Parameters<typeof HelperTaskView>
): ReturnType<typeof render> => {
  const [{ task, refreshTask }] = args;
  return render(
    <MemoryRouter>
      <HelperTaskView task={task} refreshTask={refreshTask} />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  vi.mocked(useCurrentUser).mockReset();
});

describe("HelperTaskView - task detail page render", () => {
  describe("regular user", () => {
    test("does not show an Actions menu or New Task button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(regularUser);
      renderView({ task: makeTask(), refreshTask: vi.fn() });

      expect(
        screen.queryByRole("button", { name: "Actions" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("New Task")).not.toBeInTheDocument();
    });

    test("renders task title and description", () => {
      vi.mocked(useCurrentUser).mockReturnValue(regularUser);
      const task = makeTask({
        title: "My Test Task",
        shortDescription: "A short description",
      });
      renderView({ task, refreshTask: vi.fn() });

      // PageTitle renders the title in two spans (mobile + desktop), so use getAllByText
      expect(screen.getAllByText("My Test Task").length).toBeGreaterThan(0);
      expect(screen.getByText("A short description")).toBeInTheDocument();
    });
  });

  describe("editor without edit rights (not the contact)", () => {
    test("does not show the Actions menu button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "OTHER_USER" }),
      });
      renderView({ task, refreshTask: vi.fn() });

      expect(
        screen.queryByRole("button", { name: "Actions" }),
      ).not.toBeInTheDocument();
    });

    test("shows New Task instead of the full Actions menu", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "OTHER_USER" }),
      });
      const { container } = renderView({ task, refreshTask: vi.fn() });

      expect(container).toHaveTextContent("New Task");
    });

    test("does not expose Edit Task option", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "OTHER_USER" }),
      });
      renderView({ task, refreshTask: vi.fn() });

      expect(screen.queryByText("Edit Task")).not.toBeInTheDocument();
    });
  });

  describe("editor with edit rights (is the contact)", () => {
    test("shows the Actions menu button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({ contact: makeMember({ username: "EDITOR" }) });
      renderView({ task, refreshTask: vi.fn() });

      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
    });

    test("Edit Task is accessible from the Actions menu", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({ contact: makeMember({ username: "EDITOR" }) });
      renderView({ task, refreshTask: vi.fn() });

      // "Edit Task" appears in SpeedDial tooltip labels (mobile) even when menu is closed
      expect(screen.queryAllByText("Edit Task").length).toBeGreaterThan(0);
    });
  });

  describe("admin", () => {
    test("shows the Actions menu button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      renderView({ task: makeTask(), refreshTask: vi.fn() });

      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
    });

    test("Edit Task is accessible from the Actions menu", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      renderView({ task: makeTask(), refreshTask: vi.fn() });

      // "Edit Task" appears in SpeedDial tooltip labels (mobile) even when menu is closed
      expect(screen.queryAllByText("Edit Task").length).toBeGreaterThan(0);
    });

    test("admin can edit any task (not just tasks they are the contact for)", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderView({ task, refreshTask: vi.fn() });

      // "Edit Task" appears in SpeedDial tooltip labels (mobile) even when menu is closed
      expect(screen.queryAllByText("Edit Task").length).toBeGreaterThan(0);
    });
  });
});
