import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import useDelayedRef from "@/hooks/useDelayedRef";

describe("useDelayedRef", () => {
  test("initialises with given value", () => {
    const { result } = renderHook(() => useDelayedRef("init"));

    expect(result.current.get()).toBe("init");
  });

  test("setImmediately updates value right away", async () => {
    const { result } = renderHook(() => useDelayedRef("init"));

    await act(() => result.current.setImmediately("updated"));

    expect(result.current.get()).toBe("updated");
  });

  test("setWithDelay updates value after delay", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useDelayedRef("init", 300));

    await act(() => result.current.setWithDelay("delayed"));

    // Not yet updated
    expect(result.current.get()).toBe("init");

    await act(() => vi.advanceTimersByTime(300));

    expect(result.current.get()).toBe("delayed");

    vi.useRealTimers();
  });

  test("setWithDelay debounces", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useDelayedRef("init", 300));

    await act(() => result.current.setWithDelay("a"));
    await act(() => vi.advanceTimersByTime(100));
    await act(() => result.current.setWithDelay("b"));

    await act(() => vi.advanceTimersByTime(300));

    expect(result.current.get()).toBe("b");

    vi.useRealTimers();
  });
});
