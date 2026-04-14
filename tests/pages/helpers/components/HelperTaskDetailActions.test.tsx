import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { makeMember, makeTask, makeUser } from "@tests/factories";

import useCurrentUser from "@/context/auth/useCurrentUser";
import HelperTaskDetailActions from "@/pages/helpers/components/HelperTaskDetailActions";

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

const renderActions = (
  ...args: Parameters<typeof HelperTaskDetailActions>
): ReturnType<typeof render> => {
  const [{ task }] = args;
  return render(
    <MemoryRouter>
      <HelperTaskDetailActions task={task} />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  vi.mocked(useCurrentUser).mockReset();
});

describe("HelperTaskDetailActions", () => {
  describe("regular user (no admin/editor role)", () => {
    test("renders nothing", () => {
      vi.mocked(useCurrentUser).mockReturnValue(regularUser);
      const { container } = renderActions({ task: makeTask() });
      expect(container.innerHTML).toBe("");
    });
  });

  describe("editor without edit rights (not the contact)", () => {
    test("shows New Task only - no Actions menu, Edit Task, or Clone Task", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderActions({ task });

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
    test("shows full Actions menu with all options - no standalone New Task", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({ contact: makeMember({ username: "EDITOR" }) });
      renderActions({ task });

      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
      // SpeedDial tooltip labels are present in the DOM even when dial is closed
      expect(screen.getAllByText("Edit Task").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Clone Task").length).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Clone to Multiple Dates").length,
      ).toBeGreaterThan(0);
      expect(screen.getAllByText("New Task").length).toBeGreaterThan(0);
    });
  });

  describe("admin", () => {
    test("shows full Actions menu for own tasks", () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      const task = makeTask({ contact: makeMember({ username: "ADMIN" }) });
      renderActions({ task });

      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
      expect(screen.getAllByText("Edit Task").length).toBeGreaterThan(0);
      expect(screen.queryByText("Clone Task")).toBeInTheDocument();
    });

    test("shows full Actions menu even when not the contact", () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderActions({ task });

      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
      expect(screen.getAllByText("Edit Task").length).toBeGreaterThan(0);
      expect(screen.queryByText("Clone Task")).toBeInTheDocument();
    });
  });
});
