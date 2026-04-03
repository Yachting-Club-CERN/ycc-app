import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import RowStack from "@/components/layout/RowStack";

const InvisibleChildNull = (): React.ReactNode => null;
const InvisibleChildUndefined = (): React.ReactNode => undefined;
const InvisibleChildEmptyFragment = (): React.ReactNode => <></>;

describe("RowStack", () => {
  test("returns null when no children are passed", () => {
    const { container } = render(<RowStack wrap={false} />);
    expect(container.innerHTML).toBe("");
  });

  test("returns null when only null children are passed", () => {
    const { container } = render(<RowStack wrap={false}>{null}</RowStack>);
    expect(container.innerHTML).toBe("");
  });

  test("returns null when only undefined children are passed", () => {
    const { container } = render(<RowStack wrap={false}>{undefined}</RowStack>);
    expect(container.innerHTML).toBe("");
  });

  test("returns null when only boolean children are passed", () => {
    const { container } = render(
      <RowStack wrap={false}>
        {false}
        {true}
      </RowStack>,
    );
    expect(container.innerHTML).toBe("");
  });

  test("returns null when mixing null, undefined and boolean children", () => {
    const { container } = render(
      <RowStack wrap={false}>
        {null}
        {undefined}
        {false}
      </RowStack>,
    );
    expect(container.innerHTML).toBe("");
  });

  test("renders visible children", () => {
    render(
      <RowStack wrap={false}>
        <span>child</span>
      </RowStack>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  test("renders string children", () => {
    render(<RowStack wrap={false}>hello</RowStack>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  test("renders visible children alongside null children", () => {
    render(
      <RowStack wrap={false}>
        {null}
        <span>visible</span>
        {undefined}
      </RowStack>,
    );
    expect(screen.getByText("visible")).toBeInTheDocument();
  });

  test("hides stack when all children are components that render nothing", () => {
    const { container } = render(
      <RowStack wrap={false}>
        <InvisibleChildNull />
        <InvisibleChildUndefined />
        <InvisibleChildEmptyFragment />
      </RowStack>,
    );
    expect(container.firstElementChild).toHaveStyle({ display: "none" });
  });

  test("shows stack when at least one child component renders content", () => {
    const { container } = render(
      <RowStack wrap={false}>
        <InvisibleChildNull />
        <span>visible</span>
        <InvisibleChildUndefined />
        <InvisibleChildEmptyFragment />
      </RowStack>,
    );
    expect(container.firstElementChild).not.toHaveStyle({ display: "none" });
    expect(screen.getByText("visible")).toBeInTheDocument();
  });

  test("returns null when children is an empty mapped array", () => {
    const items: string[] = [];
    const { container } = render(
      <RowStack wrap={false}>
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </RowStack>,
    );
    expect(container.innerHTML).toBe("");
  });

  test("returns null when conditional children evaluate to false", () => {
    const show = false;
    const { container } = render(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- testing the common {condition && <Component>} pattern
      <RowStack wrap={false}>{show && <span>hidden</span>}</RowStack>,
    );
    expect(container.innerHTML).toBe("");
  });

  test("hides stack when children toggle from visible to invisible", () => {
    const { container, rerender } = render(
      <RowStack wrap={false}>
        <span>visible</span>
      </RowStack>,
    );
    expect(container.firstElementChild).not.toHaveStyle({ display: "none" });

    rerender(
      <RowStack wrap={false}>
        <InvisibleChildNull />
        <InvisibleChildUndefined />
        <InvisibleChildEmptyFragment />
      </RowStack>,
    );
    expect(container.firstElementChild).toHaveStyle({ display: "none" });
  });

  test("applies flex-wrap when wrap is true", () => {
    const { container } = render(
      <RowStack wrap>
        <span>child</span>
      </RowStack>,
    );
    const stack = container.firstElementChild!;
    expect(stack).toHaveStyle({ flexWrap: "wrap" });
  });

  test("does not apply flex-wrap when wrap is false", () => {
    const { container } = render(
      <RowStack wrap={false}>
        <span>child</span>
      </RowStack>,
    );
    const stack = container.firstElementChild!;
    expect(stack).not.toHaveStyle({ flexWrap: "wrap" });
  });

  test("applies custom alignItems", () => {
    const { container } = render(
      <RowStack wrap={false} alignItems="flex-start">
        <span>child</span>
      </RowStack>,
    );
    const stack = container.firstElementChild!;
    expect(stack).toHaveStyle({ alignItems: "flex-start" });
  });

  test("defaults alignItems to center", () => {
    const { container } = render(
      <RowStack wrap={false}>
        <span>child</span>
      </RowStack>,
    );
    const stack = container.firstElementChild!;
    expect(stack).toHaveStyle({ alignItems: "center" });
  });

  test("passes extra props to the underlying Stack", () => {
    render(
      <RowStack wrap={false} data-testid="custom-stack">
        <span>child</span>
      </RowStack>,
    );
    expect(screen.getByTestId("custom-stack")).toBeInTheDocument();
  });
});
