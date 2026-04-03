import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import ConfirmButton from "@/components/buttons/ConfirmButton";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog/ConfirmationDialog";
import { CONFIRM_BUTTON_DELAY_MS } from "@/utils/constants";

describe("ConfirmButton", () => {
  test("renders with default text and color", async () => {
    await act(async () => {
      render(<ConfirmButton onConfirm={vi.fn()} loading={false} />);
    });

    const button = screen.getByRole("button", { name: "Confirm" });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveClass("MuiButton-containedSuccess");
  });

  test("renders with custom text", () => {
    render(<ConfirmButton onConfirm={vi.fn()} loading={false} text="Delete" />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  test("renders with custom color", () => {
    render(<ConfirmButton onConfirm={vi.fn()} loading={false} color="error" />);

    expect(screen.getByRole("button")).toHaveClass("MuiButton-containedError");
  });

  test("calls onConfirm when clicked", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmButton onConfirm={onConfirm} loading={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  test("is disabled when delayed", () => {
    vi.useFakeTimers();

    render(<ConfirmButton onConfirm={vi.fn()} loading={false} delayed />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/Confirm \(\d+s\)/);

    vi.useRealTimers();
  });

  test("does not call onConfirm while delayed", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<ConfirmButton onConfirm={onConfirm} loading={false} delayed />);

    await user.click(screen.getByRole("button"));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  test("becomes enabled after countdown completes", async () => {
    vi.useFakeTimers();

    render(<ConfirmButton onConfirm={vi.fn()} loading={false} delayed />);

    expect(screen.getByRole("button")).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole("button")).toBeEnabled();
    expect(screen.getByRole("button")).toHaveTextContent("Confirm");

    vi.useRealTimers();
  });

  test("countdown shows decreasing seconds", async () => {
    vi.useFakeTimers();

    render(<ConfirmButton onConfirm={vi.fn()} loading={false} delayed />);

    expect(screen.getByRole("button")).toHaveTextContent("Confirm (3s)");

    await act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("button")).toHaveTextContent("Confirm (2s)");

    await act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("button")).toHaveTextContent("Confirm (1s)");

    await act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("button")).toHaveTextContent("Confirm");

    vi.useRealTimers();
  });

  test("is not delayed when delayed prop is false", () => {
    render(
      <ConfirmButton onConfirm={vi.fn()} loading={false} delayed={false} />,
    );

    expect(screen.getByRole("button")).toBeEnabled();
    expect(screen.getByRole("button")).toHaveTextContent("Confirm");
  });
});

describe("ConfirmationDialog remounts ConfirmButton on reopen", () => {
  test("delayed countdown resets when dialog is closed and reopened", async () => {
    vi.useFakeTimers();

    const onConfirm = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <ConfirmationDialog
        title="Delete?"
        content={null}
        open={true}
        confirming={false}
        delayConfirm={true}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    // Button starts disabled with full countdown
    const button = screen.getByRole("button", { name: /Confirm/ });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(
      `Confirm (${CONFIRM_BUTTON_DELAY_MS / 1000}s)`,
    );

    // Let the countdown finish
    await act(async () => {
      vi.advanceTimersByTime(CONFIRM_BUTTON_DELAY_MS);
    });
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();

    // Close the dialog
    rerender(
      <ConfirmationDialog
        title="Delete?"
        content={null}
        open={false}
        confirming={false}
        delayConfirm={true}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    // Reopen the dialog — ConfirmButton should remount with fresh countdown
    rerender(
      <ConfirmationDialog
        title="Delete?"
        content={null}
        open={true}
        confirming={false}
        delayConfirm={true}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    const reopenedButton = screen.getByRole("button", { name: /Confirm/ });
    expect(reopenedButton).toBeDisabled();
    expect(reopenedButton).toHaveTextContent(
      `Confirm (${CONFIRM_BUTTON_DELAY_MS / 1000}s)`,
    );

    vi.useRealTimers();
  });
});
