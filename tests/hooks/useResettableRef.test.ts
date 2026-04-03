import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import useResettableRef from "@/hooks/useResettableRef";

describe("useResettableRef", () => {
  test("initialises with value from factory", () => {
    const { result } = renderHook(() => useResettableRef(() => 42));

    expect(result.current.current).toBe(42);
  });

  test("allows setting current value", async () => {
    const { result } = renderHook(() => useResettableRef(() => "initial"));

    await act(async () => {
      result.current.current = "updated";
    });

    expect(result.current.current).toBe("updated");
  });

  test("reset restores the initial value", async () => {
    const { result } = renderHook(() => useResettableRef(() => 0));

    await act(async () => {
      result.current.current = 99;
    });
    expect(result.current.current).toBe(99);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.current).toBe(0);
  });

  test("reset calls the factory again", async () => {
    const factory = vi.fn(() => ({ count: 0 }));
    const { result } = renderHook(() => useResettableRef(factory));

    // Factory called once on init
    expect(factory).toHaveBeenCalledOnce();

    await act(async () => {
      result.current.reset();
    });

    // Factory called again on reset
    expect(factory).toHaveBeenCalledTimes(2);
  });

  test("reset produces a fresh object reference", async () => {
    const { result } = renderHook(() =>
      useResettableRef(() => ({ value: "fresh" })),
    );

    const firstRef = result.current.current;

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.current).toEqual({ value: "fresh" });
    expect(result.current.current).not.toBe(firstRef);
  });
});
