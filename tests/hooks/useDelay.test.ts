import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import useDelay from "@/hooks/useDelay";

describe("useDelay", () => {
  test("calls callback after delay", async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const { result } = renderHook(() => useDelay(200, callback));

    await act(() => result.current("value"));

    expect(callback).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTime(200));

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("value");

    vi.useRealTimers();
  });

  test("resets timer on repeated calls (debounce)", async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const { result } = renderHook(() => useDelay(200, callback));

    await act(() => result.current("first"));
    await act(() => vi.advanceTimersByTime(100));

    // Call again before timeout - should reset
    await act(() => result.current("second"));
    await act(() => vi.advanceTimersByTime(100));

    // 200ms from first call, but only 100ms from second - should not have fired
    expect(callback).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTime(100));

    // Now 200ms from second call
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("second");

    vi.useRealTimers();
  });

  test("cleans up timeout on unmount", async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const { result, unmount } = renderHook(() => useDelay(200, callback));

    await act(() => result.current("value"));
    unmount();

    await act(() => vi.advanceTimersByTime(200));

    expect(callback).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
