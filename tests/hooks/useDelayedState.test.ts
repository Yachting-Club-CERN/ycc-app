import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import useDelayedState from "@/hooks/useDelayedState";

describe("useDelayedState", () => {
  test("initialises both states with initial value", () => {
    const { result } = renderHook(() => useDelayedState("init"));

    const [state, delayedState] = result.current;
    expect(state).toBe("init");
    expect(delayedState).toBe("init");
  });

  test("setImmediately updates both states instantly", async () => {
    const { result } = renderHook(() => useDelayedState("init"));

    await act(() => {
      const setImmediately = result.current[2];
      setImmediately("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(result.current[1]).toBe("updated");
  });

  test("setWithDelay updates state immediately but delays delayedState", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useDelayedState("init", 300));

    await act(() => {
      const setWithDelay = result.current[3];
      setWithDelay("typed");
    });

    // Immediate state updated right away
    expect(result.current[0]).toBe("typed");
    // Delayed state still old
    expect(result.current[1]).toBe("init");

    await act(() => vi.advanceTimersByTime(300));

    // Now delayed state is updated too
    expect(result.current[0]).toBe("typed");
    expect(result.current[1]).toBe("typed");

    vi.useRealTimers();
  });

  test("setWithDelay debounces rapid changes", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useDelayedState("", 300));

    await act(() => result.current[3]("a"));
    await act(() => vi.advanceTimersByTime(100));
    await act(() => result.current[3]("ab"));
    await act(() => vi.advanceTimersByTime(100));
    await act(() => result.current[3]("abc"));

    // Immediate state follows each change
    expect(result.current[0]).toBe("abc");
    // Delayed state hasn't caught up yet
    expect(result.current[1]).toBe("");

    await act(() => vi.advanceTimersByTime(300));

    // Only the final value lands in delayed state
    expect(result.current[1]).toBe("abc");

    vi.useRealTimers();
  });
});
