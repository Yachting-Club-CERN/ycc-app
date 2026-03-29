import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import ConfirmButton from "@/components/buttons/ConfirmButton";

describe("ConfirmButton", () => {
  test("renders with default text and color", () => {
    render(<ConfirmButton onConfirm={vi.fn()} loading={false} />);

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

  test("becomes enabled after countdown completes", () => {
    vi.useFakeTimers();

    render(<ConfirmButton onConfirm={vi.fn()} loading={false} delayed />);

    expect(screen.getByRole("button")).toBeDisabled();

    act(() => {
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
