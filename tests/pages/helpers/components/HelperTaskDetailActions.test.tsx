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
    test("does not show the Actions menu button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderActions({ task });
      expect(
        screen.queryByRole("button", { name: "Actions" }),
      ).not.toBeInTheDocument();
    });

    test("shows a New Task button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      const { container } = renderActions({ task });
      expect(container).toHaveTextContent("New Task");
    });

    test("does not expose an Edit Task link", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderActions({ task });
      expect(screen.queryByText("Edit Task")).not.toBeInTheDocument();
    });
  });

  describe("editor with edit rights (is the contact)", () => {
    test("shows the Actions menu button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({ contact: makeMember({ username: "EDITOR" }) });
      renderActions({ task });
      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
    });

    test("shows Edit Task in the Actions menu", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({ contact: makeMember({ username: "EDITOR" }) });
      renderActions({ task });

      // "Edit Task" appears in SpeedDial tooltip labels (mobile) even when menu is closed
      expect(screen.queryAllByText("Edit Task").length).toBeGreaterThan(0);
    });

    test("shows Clone Task in the Actions menu", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({ contact: makeMember({ username: "EDITOR" }) });
      renderActions({ task });

      // "Clone Task" appears in SpeedDial tooltip labels (mobile) even when menu is closed
      expect(screen.queryAllByText("Clone Task").length).toBeGreaterThan(0);
    });
  });

  describe("admin", () => {
    test("shows the Actions menu button", () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      renderActions({ task: makeTask() });
      expect(
        screen.getByRole("button", { name: "Actions" }),
      ).toBeInTheDocument();
    });

    test("shows Edit Task in the Actions menu", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      renderActions({ task: makeTask() });

      // "Edit Task" appears in SpeedDial tooltip labels (mobile) even when menu is closed
      expect(screen.queryAllByText("Edit Task").length).toBeGreaterThan(0);
    });

    test("can edit any task regardless of contact", async () => {
      vi.mocked(useCurrentUser).mockReturnValue(adminUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      renderActions({ task });

      // "Edit Task" appears in SpeedDial tooltip labels (mobile) even when menu is closed
      expect(screen.queryAllByText("Edit Task").length).toBeGreaterThan(0);
    });
  });
});
