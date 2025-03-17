import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useContext, useEffect, useState } from "react";

import SpacedTypography from "@/components/SpacedTypography";
import AuthenticationContext from "@/context/AuthenticationContext";
import useDelayedState from "@/hooks/useDelayedState";
import { HelperTaskState } from "@/model/helpers-dtos";
import { getCurrentYear } from "@/utils/date-utils";
import { SEARCH_DELAY_MS } from "@/utils/search-utils";

import {
  HelperTaskFilterOptions,
  doneEmoji,
  validatedEmoji,
} from "./helpers-utils";
import HelperTasksView from "./HelperTasksView";
import PageTitleWithTaskActions from "./PageTitleWithTaskActions";

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
  [HelperTaskState.Done]: `Done, but not validated ${doneEmoji}`,
  [HelperTaskState.Validated]: `Validated ${validatedEmoji}`,
};

const allYearsLabel = "ALL";

const getDefaultFilterOptions = (): HelperTaskFilterOptions => ({
  year: getCurrentYear(),
  search: "",
  showOnlyUpcoming: true,
  showOnlyContactOrSignedUp: false,
  showOnlyAvailable: false,
  showOnlyUnpublished: false,
  states: [HelperTaskState.Pending],
});

const filterOptionsSessionStorageKey = "helpers.grid.filterOptions";

const HelpersPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const firstHelperAppYear = 2023;
  const currentYear = getCurrentYear();

  const [
    filterOptions,
    delayedFilterOptions,
    setFilterOptionsImmediately,
    setFilterOptionsWithDelay,
  ] = useDelayedState<HelperTaskFilterOptions>(() => {
    try {
      const savedFilterOptions = sessionStorage.getItem(
        filterOptionsSessionStorageKey,
      );
      return savedFilterOptions
        ? (JSON.parse(savedFilterOptions) as HelperTaskFilterOptions)
        : getDefaultFilterOptions();
    } catch (error) {
      console.error("Error parsing filter options from sessionStorage:", error);
      return getDefaultFilterOptions();
    }
  }, SEARCH_DELAY_MS);
  const [display, setDisplay] = useState<"grid" | "report">("grid");

  useEffect(() => {
    console.log("Save filter options to session storage", filterOptions);
    sessionStorage.setItem(
      filterOptionsSessionStorageKey,
      JSON.stringify(filterOptions),
    );
  }, [delayedFilterOptions]);

  const years = Array.from(
    { length: currentYear - firstHelperAppYear + 1 },
    (_, i) => firstHelperAppYear + i,
  );

  const onReset = () => {
    setFilterOptionsImmediately(getDefaultFilterOptions());
  };

  const onYearChange = (event: SelectChangeEvent) => {
    const year =
      event.target.value === allYearsLabel
        ? null
        : parseInt(event.target.value);
    const newFilterOptions: HelperTaskFilterOptions = { ...filterOptions };

    newFilterOptions.year = year;
    if (year === currentYear) {
      if (checkArrayContainsAllElements(newFilterOptions.states, allStates)) {
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

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptionsWithDelay({
      ...filterOptions,
      search: event.target.value,
    });
  };

  const handleStateChange = (event: SelectChangeEvent<HelperTaskState[]>) => {
    const value = event.target.value;
    const values = typeof value === "string" ? value.split(",") : value;

    setFilterOptionsImmediately({
      ...filterOptions,
      states: values.map(
        (v) => HelperTaskState[v as keyof typeof HelperTaskState],
      ),
    });
  };

  return (
    <>
      <PageTitleWithTaskActions value="Helper Tasks" />

      <SpacedTypography>
        On this page you can sign up for surveillance and maintenance tasks.
        Captain means Q-boat driver or the person who is organising the
        execution of the task.
      </SpacedTypography>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        mt={2}
        mb={0}
        useFlexGap
        flexWrap="wrap"
      >
        {currentUser.helpersAppAdminOrEditor && (
          <>
            <SpacedTypography>Year:</SpacedTypography>
            <Select
              value={filterOptions.year?.toString() ?? allYearsLabel}
              onChange={onYearChange}
              variant="outlined"
              size="small"
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
              <MenuItem key={9999} value={allYearsLabel}>
                {allYearsLabel}
              </MenuItem>
            </Select>
          </>
        )}

        <Typography>Search:</Typography>
        <TextField
          value={filterOptions.search}
          onChange={onSearch}
          variant="outlined"
          label="Category, person, text..."
          size="small"
          sx={{
            width: 200,
          }}
          className="ycc-helpers-search-input"
        />

        <SpacedTypography>State:</SpacedTypography>
        <Select
          multiple
          value={filterOptions.states}
          onChange={handleStateChange}
          renderValue={(values) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {values.map((value) => (
                <Chip key={value} label={allStatesWithLabel[value]} />
              ))}
            </Box>
          )}
          size="small"
        >
          {Object.entries(allStatesWithLabel).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              <Checkbox
                checked={
                  filterOptions.states.indexOf(key as HelperTaskState) > -1
                }
              />
              <ListItemText primary={value} />
            </MenuItem>
          ))}
        </Select>

        <IconButton onClick={onReset} size="small">
          <RestartAltIcon />
        </IconButton>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        mt={0}
        mb={2}
        useFlexGap
        flexWrap="wrap"
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={filterOptions.showOnlyUpcoming}
              onChange={(_, checked) => {
                setFilterOptionsImmediately({
                  ...filterOptions,
                  showOnlyUpcoming: checked,
                });
              }}
              size="small"
            />
          }
          label="Only upcoming"
        />

        <FormControlLabel
          control={
            <Checkbox
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
              size="small"
            />
          }
          label="Only mine"
        />

        <FormControlLabel
          control={
            <Checkbox
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
              size="small"
            />
          }
          label="Only available"
        />

        {currentUser.helpersAppAdminOrEditor && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterOptions.showOnlyUnpublished}
                  onChange={(_, checked) => {
                    setFilterOptionsImmediately({
                      ...filterOptions,
                      showOnlyUnpublished: checked,
                    });
                  }}
                  size="small"
                />
              }
              label="Only unpublished"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={display === "report"}
                  onChange={(_, checked) => {
                    setDisplay(checked ? "report" : "grid");
                  }}
                  size="small"
                />
              }
              label="Report view"
            />
          </>
        )}
      </Stack>

      <HelperTasksView display={display} filterOptions={delayedFilterOptions} />
    </>
  );
};

export default HelpersPage;
