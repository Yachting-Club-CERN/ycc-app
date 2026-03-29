import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";

import useDocumentTitle from "@/hooks/useDocumentTitle";

const APP_TITLE = "YCC App";

describe("useDocumentTitle", () => {
  beforeEach(() => {
    document.title = APP_TITLE;
  });

  test("sets document.title to 'title | YCC App' on mount", () => {
    renderHook(() => useDocumentTitle("Test Page"));
    expect(document.title).toBe(`Test Page | ${APP_TITLE}`);
  });

  test("resets document.title to previous value on unmount", () => {
    const { unmount } = renderHook(() => useDocumentTitle("Test Page"));
    expect(document.title).toBe(`Test Page | ${APP_TITLE}`);
    unmount();
    expect(document.title).toBe(APP_TITLE);
  });

  test("updates document.title when value changes", () => {
    const { rerender } = renderHook(
      ({ title }: { title: string }) => useDocumentTitle(title),
      { initialProps: { title: "Page 1" } },
    );
    expect(document.title).toBe(`Page 1 | ${APP_TITLE}`);
    rerender({ title: "Page 2" });
    expect(document.title).toBe(`Page 2 | ${APP_TITLE}`);
  });

  test("stacks correctly when multiple components use the hook", () => {
    const { unmount: unmount1 } = renderHook(() =>
      useDocumentTitle("Task: My Boat Race"),
    );
    expect(document.title).toBe(`Task: My Boat Race | ${APP_TITLE}`);

    // Simulates navigating away: old page unmounts and new page mounts
    unmount1();
    expect(document.title).toBe(APP_TITLE);

    const { unmount: unmount2 } = renderHook(() =>
      useDocumentTitle("Helper Tasks"),
    );
    expect(document.title).toBe(`Helper Tasks | ${APP_TITLE}`);

    unmount2();
    expect(document.title).toBe(APP_TITLE);
  });
});
