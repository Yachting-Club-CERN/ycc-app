import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {HelperTaskState} from 'model/helpers-dtos';
import React, {useContext, useEffect, useState} from 'react';

import SpacedTypography from '@app/components/SpacedTypography';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useDelay from '@app/hooks/useDelay';
import {getCurrentYear} from '@app/utils/date-utils';
import {SEARCH_DELAY_MS} from '@app/utils/search-utils';

import HelperTasksDataGrid from './HelperTasksDataGrid';
import PageTitleWithTaskActions from './PageTitleWithTaskActions';
import {
  HelperTaskFilterOptions,
  doneEmoji,
  validatedEmoji,
} from './helpers-utils';

const checkArrayContainsAllElements = <T,>(states: T[], arr: T[]): boolean => {
  return arr.every(state => states.includes(state));
};

const allStates = [
  HelperTaskState.Pending,
  HelperTaskState.Done,
  HelperTaskState.Validated,
];

const allStatesWithLabel = {
  [HelperTaskState.Pending]: 'Pending',
  [HelperTaskState.Done]: `Done, but not validated ${doneEmoji}`,
  [HelperTaskState.Validated]: `Validated ${validatedEmoji}`,
};

const getDefaultFilterOptions = (): HelperTaskFilterOptions => ({
  year: getCurrentYear(),
  search: '',
  showOnlyUpcoming: true,
  showOnlyContactOrSignedUp: false,
  showOnlyAvailable: false,
  showOnlyUnpublished: false,
  states: [HelperTaskState.Pending],
});

const filterOptionsSessionStorageKey = 'helpers.grid.filterOptions';

const HelpersPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const firstHelperAppYear = 2023;
  const currentYear = getCurrentYear();

  const [filterOptions, setFilterOptions] = useState<HelperTaskFilterOptions>(
    () => {
      try {
        const savedFilterOptions = sessionStorage.getItem(
          filterOptionsSessionStorageKey
        );
        return savedFilterOptions
          ? JSON.parse(savedFilterOptions)
          : getDefaultFilterOptions();
      } catch (error) {
        console.error(
          'Error parsing filter options from sessionStorage:',
          error
        );
        return getDefaultFilterOptions();
      }
    }
  );

  useEffect(() => {
    console.log('Save filter options to session storage', filterOptions);
    sessionStorage.setItem(
      filterOptionsSessionStorageKey,
      JSON.stringify(filterOptions)
    );
  }, [filterOptions]);

  const years = Array.from(
    {length: currentYear - firstHelperAppYear + 1},
    (_, i) => firstHelperAppYear + i
  );

  const onReset = () => {
    setFilterOptions(getDefaultFilterOptions());
  };

  const onYearChange = (event: SelectChangeEvent) => {
    const year =
      event.target.value === 'ALL' ? null : parseInt(event.target.value);
    const newFilterOptions: HelperTaskFilterOptions = {...filterOptions};

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

    setFilterOptions(newFilterOptions);
  };

  const onSearch = useDelay(
    SEARCH_DELAY_MS,
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilterOptions({
        ...filterOptions,
        search: event.target.value,
      });
    }
  );

  const handleCheckboxChange = (
    event: React.SyntheticEvent,
    handler: (checked: boolean) => void
  ) => {
    const {checked} = event.target as HTMLInputElement;
    handler(checked);
  };

  const handleStateChange = (event: SelectChangeEvent<HelperTaskState[]>) => {
    const value = event.target.value;
    const values = typeof value === 'string' ? value.split(',') : value;

    setFilterOptions({
      ...filterOptions,
      states: values.map(
        v => HelperTaskState[v as keyof typeof HelperTaskState]
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
              value={filterOptions.year?.toString() ?? 'ALL'}
              onChange={onYearChange}
              variant="outlined"
              size="small"
            >
              {years.map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
              <MenuItem key={9999} value="ALL">
                ALL
              </MenuItem>
            </Select>
          </>
        )}

        <Typography>Search:</Typography>
        <TextField
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
          renderValue={values => (
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
              {values.map(value => (
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
              onChange={event =>
                handleCheckboxChange(event, checked =>
                  setFilterOptions({
                    ...filterOptions,
                    showOnlyUpcoming: checked,
                  })
                )
              }
              size="small"
            />
          }
          label="Only upcoming"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={filterOptions.showOnlyContactOrSignedUp}
              onChange={event =>
                handleCheckboxChange(event, checked => {
                  const newFilterOptions: HelperTaskFilterOptions = {
                    ...filterOptions,
                  };
                  newFilterOptions.showOnlyContactOrSignedUp = checked;
                  if (checked) {
                    newFilterOptions.showOnlyAvailable = false;
                  }
                  setFilterOptions(newFilterOptions);
                })
              }
              size="small"
            />
          }
          label="Only mine"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={filterOptions.showOnlyAvailable}
              onChange={event =>
                handleCheckboxChange(event, checked => {
                  const newFilterOptions: HelperTaskFilterOptions = {
                    ...filterOptions,
                  };
                  newFilterOptions.showOnlyAvailable = checked;
                  if (checked) {
                    newFilterOptions.showOnlyContactOrSignedUp = false;
                    newFilterOptions.states = [HelperTaskState.Pending];
                  }
                  setFilterOptions(newFilterOptions);
                })
              }
              size="small"
            />
          }
          label="Only available"
        />

        {currentUser.helpersAppAdminOrEditor && (
          <FormControlLabel
            control={
              <Checkbox
                checked={filterOptions.showOnlyUnpublished}
                onChange={event =>
                  handleCheckboxChange(event, checked =>
                    setFilterOptions({
                      ...filterOptions,
                      showOnlyUnpublished: checked,
                    })
                  )
                }
                size="small"
              />
            }
            label="Only unpublished"
          />
        )}
      </Stack>

      <HelperTasksDataGrid filterOptions={filterOptions} />
    </>
  );
};

export default HelpersPage;
