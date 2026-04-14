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
    test("renders nothing", () => {
      vi.mocked(useCurrentUser).mockReturnValue(editorUser);
      const task = makeTask({
        contact: makeMember({ username: "SOMEONE_ELSE" }),
      });
      const { container } = renderActions({ task });

      expect(container.innerHTML).toBe("");
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
