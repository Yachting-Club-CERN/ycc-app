import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { makeMember, makeTask } from "@tests/factories";
import {
  adminUser,
  editorUser,
  regularUser,
} from "@tests/pages/helpers/helpers-test-fixtures";

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
    test("renders task content but no admin/editor actions", () => {
      vi.mocked(useCurrentUser).mockReturnValue(regularUser);
      const task = makeTask({
        title: "My Test Task",
        shortDescription: "A short description",
      });
      renderView({ task, refreshTask: vi.fn() });

      // Task content is visible
      // PageTitle renders the title in two spans (mobile + desktop), so use getAllByText
      expect(screen.getAllByText("My Test Task").length).toBeGreaterThan(0);
      expect(screen.getByText("A short description")).toBeInTheDocument();

      // No actions for regular users
      expect(
        screen.queryByRole("button", { name: "Actions" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("New Task")).not.toBeInTheDocument();
      expect(screen.queryByText("Edit Task")).not.toBeInTheDocument();
    });
  });

  describe("editor without edit rights (not the contact)", () => {
    test("shows New Task only - no Actions menu, Edit Task, or Clone Task", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "OTHER_USER" }),
      });
      renderView({ task, refreshTask: vi.fn() });

      expect(
        screen.queryByRole("button", { name: "Actions" }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByText("New Task").length).toBeGreaterThan(0);
      expect(screen.queryByText("Edit Task")).not.toBeInTheDocument();
      expect(screen.queryByText("Clone Task")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Clone to Multiple Dates"),
      ).not.toBeInTheDocument();
    });
  });

  describe("editor with edit rights (is the contact)", () => {
    test("shows full Actions menu with Edit/Clone/New Task options", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({ contact: makeMember({ username: "EDITOR" }) });
      renderView({ task, refreshTask: vi.fn() });

      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
      // SpeedDial tooltip labels are present in the DOM even when dial is closed
      expect(screen.getAllByText("Edit Task").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Clone Task").length).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Clone to Multiple Dates").length,
      ).toBeGreaterThan(0);
    });
  });

  describe("admin", () => {
    test("shows full Actions menu and can edit any task regardless of contact", () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      // Admin is not the contact - should still get the full Actions menu
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderView({ task, refreshTask: vi.fn() });

      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
      expect(screen.getAllByText("Edit Task").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Clone Task").length).toBeGreaterThan(0);
      expect(screen.queryByText("Edit Task")).toBeInTheDocument();
    });
  });
});
