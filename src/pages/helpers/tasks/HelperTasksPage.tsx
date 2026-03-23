import GridOnIcon from "@mui/icons-material/GridOn";
import GridViewIcon from "@mui/icons-material/GridView";
import ListIcon from "@mui/icons-material/List";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useEffect, useState } from "react";

import {
  isValidSelectedYear,
  type SelectedYear,
  useYearSelector,
} from "@/components/input/YearSelector";
import ReadingBox from "@/components/layout/ReadingBox";
import RowStack from "@/components/layout/RowStack";
import PageTitle from "@/components/ui/PageTitle";
import useCurrentUser from "@/context/auth/useCurrentUser";
import useDelayedState from "@/hooks/useDelayedState";
import { HelperTaskState } from "@/model/helpers-dtos";
import HelpersSpeedDial from "@/pages/helpers/components/HelpersSpeedDial";
import { DONE_EMOJI, VALIDATED_EMOJI } from "@/pages/helpers/helpers-format";
import { HelperTaskFilterOptions } from "@/pages/helpers/useFilteredHelperTasks";
import { SEARCH_DELAY_MS } from "@/utils/constants";
import { getCurrentYear } from "@/utils/date-utils";

import HelperTasksView from "./HelperTasksView";
import { HelperTasksDisplay, HelperTasksDisplayOptions } from "./types";

const checkArrayContainsAllElements = <T,>(states: T[], arr: T[]): boolean => {
  return arr.every((state) => states.includes(state));
};

const allStates = [
  HelperTaskState.Pending,
  HelperTaskState.Done,
  HelperTaskState.Validated,
];

const allStatesWithLabel = {
  [HelperTaskState.Pending]: "Pending",
  [HelperTaskState.Done]: `Done, but not validated ${DONE_EMOJI}`,
  [HelperTaskState.Validated]: `Validated ${VALIDATED_EMOJI}`,
};

const getDefaultFilterOptions = (): HelperTaskFilterOptions => ({
  year: getCurrentYear(),
  search: "",
  showOnlyUpcoming: true,
  showOnlyContactOrSignedUp: false,
  showOnlyAvailable: false,
  showOnlyUnpublished: false,
  states: [HelperTaskState.Pending],
});

const SESSION_STORAGE = {
  DISPLAY: "helpers.tasks.display",
  FILTER_OPTIONS: "helpers.tasks.filterOptions",
} as const;

const HelperTasksPage = (): React.ReactNode => {
  const currentUser = useCurrentUser();
  const currentYear = getCurrentYear();

  const [
    filterOptions,
    delayedFilterOptions,
    setFilterOptionsImmediately,
    setFilterOptionsWithDelay,
  ] = useDelayedState<HelperTaskFilterOptions>(() => {
    try {
      const savedFilterOptions = sessionStorage.getItem(
        SESSION_STORAGE.FILTER_OPTIONS,
      );
      if (!savedFilterOptions) {
        return getDefaultFilterOptions();
      }

      const parsed = JSON.parse(savedFilterOptions) as HelperTaskFilterOptions;
      if (!isValidSelectedYear(parsed.year)) {
        parsed.year = currentYear;
      }
      return parsed;
    } catch (error) {
      console.error("Error parsing filter options from sessionStorage:", error);
      return getDefaultFilterOptions();
    }
  }, SEARCH_DELAY_MS);
  const [display, setDisplay] = useState<HelperTasksDisplay>(() => {
    const savedDisplay = sessionStorage.getItem(SESSION_STORAGE.DISPLAY);
    return savedDisplay && HelperTasksDisplayOptions.includes(savedDisplay)
      ? (savedDisplay as HelperTasksDisplay)
      : "cards";
  });

  // Non-admin/editor users can only view the current year
  useEffect(() => {
    if (
      !currentUser.helpersAppAdminOrEditor &&
      filterOptions.year !== currentYear
    ) {
      setFilterOptionsImmediately(getDefaultFilterOptions());
    }
  }, [currentUser.helpersAppAdminOrEditor]);

  useEffect(() => {
    console.info("Save filter options to session storage", filterOptions);
    sessionStorage.setItem(
      SESSION_STORAGE.FILTER_OPTIONS,
      JSON.stringify(filterOptions),
    );
  }, [delayedFilterOptions]);

  useEffect(() => {
    console.info("Save display to session storage", display);
    sessionStorage.setItem(SESSION_STORAGE.DISPLAY, display);
  }, [display]);

  const handleReset = (): void =>
    setFilterOptionsImmediately(getDefaultFilterOptions());

  const handleYearChange = (year: SelectedYear): void => {
    const newFilterOptions: HelperTaskFilterOptions = { ...filterOptions };

    newFilterOptions.year = year;
    if (year === currentYear) {
      if (
        newFilterOptions.states === undefined ||
        checkArrayContainsAllElements(newFilterOptions.states, allStates)
      ) {
        newFilterOptions.states = [HelperTaskState.Pending];
      }
    } else {
      newFilterOptions.showOnlyUpcoming = false;
      newFilterOptions.showOnlyAvailable = false;
      newFilterOptions.showOnlyUnpublished = false;
      newFilterOptions.states = allStates;
    }

    setFilterOptionsImmediately(newFilterOptions);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFilterOptionsWithDelay({
      ...filterOptions,
      search: event.target.value,
    });
  };

  const handleStateChange = (
    event: SelectChangeEvent<HelperTaskState[]>,
  ): void => {
    const value = event.target.value;
    const values = typeof value === "string" ? value.split(",") : value;

    setFilterOptionsImmediately({
      ...filterOptions,
      states: values.map(
        (v) => HelperTaskState[v as keyof typeof HelperTaskState],
      ),
    });
  };

  const yearSelector = useYearSelector({
    value: filterOptions.year,
    includeAllOption: true,
    onChange: handleYearChange,
  });

  return (
    <>
      <HelpersSpeedDial />

      <RowStack wrap={false} mb={2}>
        <PageTitle value="Helper Tasks" mobileValue="Tasks" />

        {currentUser.helpersAppAdminOrEditor && yearSelector.component}

        <ToggleButtonGroup
          value={display}
          exclusive
          onChange={(_, newDisplay: HelperTasksDisplay | null) => {
            if (newDisplay !== null) {
              setDisplay(newDisplay);
            }
          }}
          size="small"
        >
          <ToggleButton value="data-grid">
            <GridOnIcon />
          </ToggleButton>
          <ToggleButton value="cards">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="report">
            <ListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </RowStack>

      <ReadingBox>
        <RowStack wrap={false} compact={true} mb={1}>
          <TextField
            value={filterOptions.search}
            onChange={handleSearch}
            variant="outlined"
            label="Search boat, member..."
            size="small"
            sx={{ width: 200 }}
            className="ycc-helpers-search-input"
          />

          <Select
            multiple
            value={filterOptions.states}
            onChange={handleStateChange}
            renderValue={(values) => (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                }}
              >
                {values.map((value) => (
                  <Chip
                    key={value}
                    label={allStatesWithLabel[value]}
                    size="small"
                  />
                ))}
              </Box>
            )}
            size="small"
          >
            {Object.entries(allStatesWithLabel).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                <Checkbox
                  checked={filterOptions.states?.includes(
                    key as HelperTaskState,
                  )}
                />
                <ListItemText primary={value} />
              </MenuItem>
            ))}
          </Select>

          <IconButton onClick={handleReset} size="small">
            <RestartAltIcon />
          </IconButton>
        </RowStack>

        <RowStack wrap={true} compact={true} mb={2}>
          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.showOnlyUpcoming}
                onChange={(_, checked) => {
                  setFilterOptionsImmediately({
                    ...filterOptions,
                    showOnlyUpcoming: checked,
                  });
                }}
              />
            }
            label="Upcoming"
          />

          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.showOnlyContactOrSignedUp}
                onChange={(_, checked) => {
                  const newFilterOptions: HelperTaskFilterOptions = {
                    ...filterOptions,
                  };
                  newFilterOptions.showOnlyContactOrSignedUp = checked;
                  if (checked) {
                    newFilterOptions.showOnlyAvailable = false;
                  }
                  setFilterOptionsImmediately(newFilterOptions);
                }}
              />
            }
            label="My Tasks"
          />

          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.showOnlyAvailable}
                onChange={(_, checked) => {
                  const newFilterOptions: HelperTaskFilterOptions = {
                    ...filterOptions,
                  };
                  newFilterOptions.showOnlyAvailable = checked;
                  if (checked) {
                    newFilterOptions.showOnlyContactOrSignedUp = false;
                    newFilterOptions.states = [HelperTaskState.Pending];
                  }
                  setFilterOptionsImmediately(newFilterOptions);
                }}
              />
            }
            label="Available"
          />

          {currentUser.helpersAppAdminOrEditor && (
            <FormControlLabel
              control={
                <Switch
                  checked={filterOptions.showOnlyUnpublished}
                  onChange={(_, checked) => {
                    setFilterOptionsImmediately({
                      ...filterOptions,
                      showOnlyUnpublished: checked,
                    });
                  }}
                />
              }
              label="Unpublished"
            />
          )}
        </RowStack>
      </ReadingBox>

      <HelperTasksView display={display} filterOptions={delayedFilterOptions} />
    </>
  );
};

export default HelperTasksPage;
