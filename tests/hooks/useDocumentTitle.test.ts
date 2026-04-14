import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";

import useDocumentTitle from "@/hooks/useDocumentTitle";

describe("useDocumentTitle", () => {
  beforeEach(() => {
    document.title = "YCC App";
  });

  test.each([
    {
      name: "sets document.title on mount",
      input: "Test Page",
      expected: "Test Page | YCC App",
    },
    {
      name: "falls back to app title when empty",
      input: "",
      expected: "YCC App",
    },
    {
      name: "falls back to app title when whitespace",
      input: "   ",
      expected: "YCC App",
    },
    {
      name: "preserves special characters and emojis",
      input: "🚣 Task: Árvíztűrő tülörfúrogép",
      expected: "🚣 Task: Árvíztűrő tülörfúrogép | YCC App",
    },
  ])("$name", ({ input, expected }) => {
    renderHook(() => {
      useDocumentTitle(input);
    });
    expect(document.title).toBe(expected);
  });

  test("resets document.title to previous value on unmount", () => {
    const { unmount } = renderHook(() => {
      useDocumentTitle("Test Page");
    });
    expect(document.title).toBe("Test Page | YCC App");
    unmount();
    expect(document.title).toBe("YCC App");
  });

  test("updates document.title when value changes", () => {
    const { rerender } = renderHook(
      ({ title }: { title: string }) => {
        useDocumentTitle(title);
      },
      { initialProps: { title: "Page 1" } },
    );
    expect(document.title).toBe("Page 1 | YCC App");
    rerender({ title: "Page 2" });
    expect(document.title).toBe("Page 2 | YCC App");
  });

  test("stacks correctly when components are nested", () => {
    const { unmount: unmountOuter } = renderHook(() => {
      useDocumentTitle("Outer Page");
    });
    expect(document.title).toBe("Outer Page | YCC App");

    const { unmount: unmountInner } = renderHook(() => {
      useDocumentTitle("Inner Modal");
    });
    expect(document.title).toBe("Inner Modal | YCC App");

    unmountInner();
    expect(document.title).toBe("Outer Page | YCC App");

    unmountOuter();
    expect(document.title).toBe("YCC App");
  });
});
