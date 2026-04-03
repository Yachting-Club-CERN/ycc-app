import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import usePromise from "@/hooks/usePromise";

describe("usePromise", () => {
  test("resolves with result", async () => {
    const { result } = renderHook(() => usePromise(async () => "hello", []));

    await waitFor(() => {
      expect(result.current.pending).toBe(false);
    });

    expect(result.current.result).toBe("hello");
    expect(result.current.error).toBeNull();
  });

  test("captures error on rejection", async () => {
    const error = new Error("boom");
    const { result } = renderHook(() =>
      usePromise(async () => {
        throw error;
      }, []),
    );

    await waitFor(() => {
      expect(result.current.pending).toBe(false);
    });

    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBe(error);
  });

  test("starts in pending state", () => {
    const { result, unmount } = renderHook(() =>
      usePromise(async () => "hello", []),
    );

    expect(result.current.pending).toBe(true);
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    // Unmount to prevent state update after test ends
    unmount();
  });

  test("ignores result after unmount (abort)", async () => {
    let resolveFn: (value: string) => void;
    const promise = async (signal?: AbortSignal): Promise<string> => {
      return new Promise((resolve) => {
        resolveFn = resolve;
        signal?.addEventListener("abort", () => {
          // Simulate abort - promise never resolves with state update
        });
      });
    };

    const { result, unmount } = renderHook(() => usePromise(promise, []));

    expect(result.current.pending).toBe(true);

    // Unmount triggers abort
    unmount();

    // Resolve after unmount - should not update state
    resolveFn!("late result");

    // State should have been reset by cleanup
    expect(result.current.pending).toBe(true);
    expect(result.current.result).toBeUndefined();
  });

  test("resets and re-fetches when deps change", async () => {
    let callCount = 0;
    const { result, rerender } = renderHook(
      ({ dep }: { dep: number }) =>
        usePromise(async () => {
          callCount++;
          return `result-${dep}`;
        }, [dep]),
      { initialProps: { dep: 1 } },
    );

    await waitFor(() => {
      expect(result.current.pending).toBe(false);
    });
    expect(result.current.result).toBe("result-1");
    expect(callCount).toBe(1);

    rerender({ dep: 2 });

    await waitFor(() => {
      expect(result.current.result).toBe("result-2");
    });
    expect(callCount).toBe(2);
  });

  test("ignores error after unmount (abort)", async () => {
    let rejectFn: (error: Error) => void;
    const promise = async (): Promise<string> => {
      return new Promise((_resolve, reject) => {
        rejectFn = reject;
      });
    };

    const { result, unmount } = renderHook(() => usePromise(promise, []));

    expect(result.current.pending).toBe(true);

    // Unmount triggers abort
    unmount();

    // Reject after unmount - should not update state
    rejectFn!(new Error("late error"));

    // State should have been reset by cleanup, error not captured
    expect(result.current.pending).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  test("passes abort signal to promise", async () => {
    const signalSpy = vi.fn();

    const { unmount } = renderHook(() =>
      usePromise(async (signal?: AbortSignal) => {
        signalSpy(signal);
        return "ok";
      }, []),
    );

    await waitFor(() => {
      expect(signalSpy).toHaveBeenCalled();
    });

    const signal = signalSpy.mock.calls[0][0] as AbortSignal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);

    unmount();
    expect(signal.aborted).toBe(true);
  });
});
