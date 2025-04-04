import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import RowStack from "@/components/layout/RowStack";
import PageTitle from "@/components/ui/PageTitle";
import SpacedTypography from "@/components/ui/SpacedTypography";
import useCurrentUser from "@/context/auth/useCurrentUser";
import useDelayedState from "@/hooks/useDelayedState";
import { HelperTaskState } from "@/model/helpers-dtos";
import { getCurrentYear } from "@/utils/date-utils";
import { SEARCH_DELAY_MS } from "@/utils/search-utils";

import HelpersSpeedDial from "./components/HelpersSpeedDial";
import { doneEmoji, validatedEmoji } from "./helpers-format";
import { HelperTaskFilterOptions } from "./helpers-utils";
import HelperTasksView from "./HelperTasksView";

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
  const currentUser = useCurrentUser();
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
    console.info("Save filter options to session storage", filterOptions);
    sessionStorage.setItem(
      filterOptionsSessionStorageKey,
      JSON.stringify(filterOptions),
    );
  }, [delayedFilterOptions]);

  const years = Array.from(
    // Add the next year too
    { length: currentYear - firstHelperAppYear + 2 },
    (_, i) => firstHelperAppYear + i,
  );

  const handleReset = () => {
    setFilterOptionsImmediately(getDefaultFilterOptions());
  };

  const handleYearChange = (event: SelectChangeEvent) => {
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      <PageTitle value="Helper Tasks" />
      <HelpersSpeedDial />

      <SpacedTypography>
        On this page you can sign up for surveillance and maintenance tasks.
        Captain means Q-boat driver or the person who is organising the
        execution of the task.
      </SpacedTypography>

      <RowStack wrap={true} compact={true} mt={2} mb={0}>
        {currentUser.helpersAppAdminOrEditor && (
          <RowStack wrap={false} compact={true}>
            <Typography>Year:</Typography>
            <Select
              value={filterOptions.year?.toString() ?? allYearsLabel}
              onChange={handleYearChange}
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
          </RowStack>
        )}

        <RowStack wrap={false} compact={true}>
          <Typography>Search:</Typography>
          <TextField
            value={filterOptions.search}
            onChange={handleSearch}
            variant="outlined"
            label="Category, person, text..."
            size="small"
            sx={{
              width: 200,
            }}
            className="ycc-helpers-search-input"
          />
        </RowStack>

        <RowStack wrap={false} compact={true}>
          <Typography>State:</Typography>
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
        </RowStack>

        <IconButton onClick={handleReset} size="small">
          <RestartAltIcon />
        </IconButton>
      </RowStack>

      <RowStack wrap={true} compact={true} mt={0} mb={2}>
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
      </RowStack>

      <HelperTasksView display={display} filterOptions={delayedFilterOptions} />
    </>
  );
};

export default HelpersPage;
