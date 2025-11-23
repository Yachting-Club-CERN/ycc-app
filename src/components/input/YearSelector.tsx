import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useCallback, useMemo, useState } from "react";

import { YCC_FIRST_HELPER_APP_YEAR } from "@/utils/constants";
import { getCurrentYear } from "@/utils/date-utils";

const ALL_YEARS = "ALL";

type SelectedYear = number | typeof ALL_YEARS;

type YearSelectorProps = {
  value: SelectedYear;
  onChange: (year: SelectedYear) => void;
  includeAllOption?: boolean;
};

const YearSelector: React.FC<YearSelectorProps> = ({
  value,
  onChange,
  includeAllOption = false,
}) => {
  const currentYear = getCurrentYear();

  if (value === ALL_YEARS && !includeAllOption) {
    throw new Error(
      `YearSelector: value cannot be ${ALL_YEARS} when includeAllOption is false`,
    );
  }

  // Generate years to current year + 1
  const years = Array.from(
    { length: currentYear - YCC_FIRST_HELPER_APP_YEAR + 2 },
    (_, i) => YCC_FIRST_HELPER_APP_YEAR + i,
  );

  return (
    <TextField
      select
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === ALL_YEARS ? ALL_YEARS : Number(val));
      }}
      variant="outlined"
      size="small"
    >
      {years.map((year) => (
        <MenuItem key={year} value={year}>
          {year}
        </MenuItem>
      ))}
      {includeAllOption && (
        <MenuItem key={ALL_YEARS} value={ALL_YEARS}>
          {ALL_YEARS}
        </MenuItem>
      )}
    </TextField>
  );
};

type UseYearSelectorProps = {
  /** Initial year for uncontrolled mode. Defaults to current year if not provided. */
  initialYear?: SelectedYear;
  /** Current year value for controlled mode. If provided, component becomes controlled. */
  value?: SelectedYear;
  /** Callback when the year changes. */
  onChange?: (year: SelectedYear) => void;
} & Omit<YearSelectorProps, "value" | "onChange">;

type UseYearSelectorReturn = {
  selectedYear: SelectedYear;
  selectedYearForApi: number | null;
  component: React.ReactElement;
};

/**
 * Hook for year selection with support for both controlled and uncontrolled modes.
 *
 * **Uncontrolled mode** (hook manages state internally):
 * ```tsx
 * const yearSelector = useYearSelector({ initialYear: 2025 });
 * // Or with default (current year):
 * const yearSelector = useYearSelector();
 * ```
 *
 * **Controlled mode** (external state controls the hook):
 * ```tsx
 * const yearSelector = useYearSelector({
 *   value: externalYear,
 *   onChange: (year) => setExternalYear(year),
 *   includeAllOption: true,
 * });
 * ```
 *
 * @param props - Configuration for the year selector
 * @returns Object with selectedYear, selectedYearForApi (null if ALL_YEARS), and component
 */
const useYearSelector = (
  props: UseYearSelectorProps = {},
): UseYearSelectorReturn => {
  const { initialYear, value: externalValue, onChange, ...rest } = props;

  // Validate that both value and initialYear are not provided
  if (externalValue !== undefined && initialYear !== undefined) {
    throw new Error(
      "useYearSelector: Cannot provide both 'value' and 'initialYear'. Use 'value' for controlled mode or 'initialYear' for uncontrolled mode.",
    );
  }

  const [internalValue, setInternalValue] = useState<SelectedYear>(
    initialYear ?? getCurrentYear(),
  );

  // Use external value if provided (controlled), otherwise internal (uncontrolled)
  const selectedYear = externalValue ?? internalValue;

  const selectedYearForApi = selectedYear === ALL_YEARS ? null : selectedYear;

  const handleChange = useCallback(
    (year: SelectedYear): void => {
      // Only update internal state if uncontrolled
      if (externalValue === undefined) {
        setInternalValue(year);
      }
      onChange?.(year);
    },
    [externalValue, onChange],
  );

  const component = useMemo(
    () => (
      <YearSelector value={selectedYear} onChange={handleChange} {...rest} />
    ),
    [selectedYear, handleChange, rest],
  );

  return {
    selectedYear,
    selectedYearForApi,
    component,
  };
};

export { ALL_YEARS, useYearSelector, type SelectedYear };
export default YearSelector;
