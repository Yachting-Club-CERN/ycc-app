import { render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import YearSelector, {
  ALL_YEARS,
  isValidSelectedYear,
  isValidYear,
  useYearSelector,
} from "@/components/input/YearSelector";
import { YCC_FIRST_HELPER_APP_YEAR } from "@/utils/constants";
import { getCurrentYear } from "@/utils/date-utils";

describe("isValidYear", () => {
  const currentYear = getCurrentYear();

  test("accepts valid years", () => {
    expect(isValidYear(YCC_FIRST_HELPER_APP_YEAR)).toBe(true);
    expect(isValidYear(currentYear)).toBe(true);
    expect(isValidYear(currentYear + 1)).toBe(true);
  });

  test("rejects years out of range", () => {
    expect(isValidYear(YCC_FIRST_HELPER_APP_YEAR - 1)).toBe(false);
    expect(isValidYear(currentYear + 2)).toBe(false);
  });

  test("rejects non-integer and non-number values", () => {
    expect(isValidYear(2024.5)).toBe(false);
    expect(isValidYear("2024")).toBe(false);
    expect(isValidYear(null)).toBe(false);
    expect(isValidYear(undefined)).toBe(false);
  });
});

describe("isValidSelectedYear", () => {
  test("accepts ALL_YEARS", () => {
    expect(isValidSelectedYear(ALL_YEARS)).toBe(true);
  });

  test("accepts valid year numbers", () => {
    expect(isValidSelectedYear(getCurrentYear())).toBe(true);
  });

  test("rejects invalid values", () => {
    expect(isValidSelectedYear("INVALID")).toBe(false);
    expect(isValidSelectedYear(1900)).toBe(false);
  });
});

describe("YearSelector", () => {
  const currentYear = getCurrentYear();

  test("renders all years from first year to current + 1", () => {
    render(<YearSelector value={currentYear} onChange={vi.fn()} />);

    // Open the select dropdown
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  test("throws when value is ALL_YEARS but includeAllOption is false", () => {
    expect(() =>
      render(<YearSelector value={ALL_YEARS} onChange={vi.fn()} />),
    ).toThrow("value cannot be ALL when includeAllOption is false");
  });

  test("allows ALL_YEARS when includeAllOption is true", () => {
    expect(() =>
      render(
        <YearSelector value={ALL_YEARS} onChange={vi.fn()} includeAllOption />,
      ),
    ).not.toThrow();
  });

  test("calls onChange with a number when a year is selected", async () => {
    const onChange = vi.fn();
    render(<YearSelector value={currentYear} onChange={onChange} />);

    // Open dropdown
    await userEvent.click(screen.getByRole("combobox"));

    // Select a year from the listbox
    const listbox = within(screen.getByRole("listbox"));
    await userEvent.click(
      listbox.getByRole("option", { name: String(currentYear - 1) }),
    );

    expect(onChange).toHaveBeenCalledWith(currentYear - 1);
  });

  test("calls onChange with ALL_YEARS when ALL option is selected", async () => {
    const onChange = vi.fn();
    render(
      <YearSelector
        value={getCurrentYear()}
        onChange={onChange}
        includeAllOption
      />,
    );

    await userEvent.click(screen.getByRole("combobox"));

    const listbox = within(screen.getByRole("listbox"));
    await userEvent.click(listbox.getByRole("option", { name: "ALL" }));

    expect(onChange).toHaveBeenCalledWith(ALL_YEARS);
  });
});

describe("useYearSelector", () => {
  const currentYear = getCurrentYear();

  test("defaults to current year in uncontrolled mode", () => {
    const { result } = renderHook(() => useYearSelector());

    expect(result.current.selectedYear).toBe(currentYear);
    expect(result.current.selectedYearForApi).toBe(currentYear);
  });

  test("uses initialYear in uncontrolled mode", () => {
    const { result } = renderHook(() => useYearSelector({ initialYear: 2024 }));

    expect(result.current.selectedYear).toBe(2024);
    expect(result.current.selectedYearForApi).toBe(2024);
  });

  test("uses external value in controlled mode", () => {
    const { result } = renderHook(() =>
      useYearSelector({ value: 2025, onChange: vi.fn() }),
    );

    expect(result.current.selectedYear).toBe(2025);
    expect(result.current.selectedYearForApi).toBe(2025);
  });

  test("returns null for selectedYearForApi when ALL_YEARS", () => {
    const { result } = renderHook(() =>
      useYearSelector({
        value: ALL_YEARS,
        onChange: vi.fn(),
        includeAllOption: true,
      }),
    );

    expect(result.current.selectedYear).toBe(ALL_YEARS);
    expect(result.current.selectedYearForApi).toBeNull();
  });

  test("throws when both value and initialYear are provided", () => {
    expect(() =>
      renderHook(() => useYearSelector({ value: 2025, initialYear: 2024 })),
    ).toThrow("Cannot provide both 'value' and 'initialYear'");
  });

  test("returns a renderable component", () => {
    const { result } = renderHook(() => useYearSelector());

    render(<>{result.current.component}</>);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("updates internal state when year is selected in uncontrolled mode", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useYearSelector({ initialYear: currentYear, onChange }),
    );

    render(<>{result.current.component}</>);

    await userEvent.click(screen.getByRole("combobox"));
    const listbox = within(screen.getByRole("listbox"));
    await userEvent.click(
      listbox.getByRole("option", { name: String(currentYear - 1) }),
    );

    expect(onChange).toHaveBeenCalledWith(currentYear - 1);
    expect(result.current.selectedYear).toBe(currentYear - 1);
  });

  test("does not update internal state in controlled mode", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useYearSelector({ value: currentYear, onChange }),
    );

    render(<>{result.current.component}</>);

    await userEvent.click(screen.getByRole("combobox"));
    const listbox = within(screen.getByRole("listbox"));
    await userEvent.click(
      listbox.getByRole("option", { name: String(currentYear - 1) }),
    );

    expect(onChange).toHaveBeenCalledWith(currentYear - 1);
    // Value stays the same since it's controlled externally
    expect(result.current.selectedYear).toBe(currentYear);
  });
});
