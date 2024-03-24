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
import React, {useContext, useState} from 'react';

import SpacedTypography from '@app/components/SpacedTypography';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useDelay from '@app/hooks/useDelay';
import {getCurrentYear} from '@app/utils/date-utils';
import {SEARCH_DELAY_MS} from '@app/utils/search-utils';

import HelperTasksDataGrid from './HelperTasksDataGrid';
import PageTitleWithTaskActions from './PageTitleWithTaskActions';
import {doneEmoji, validatedEmoji} from './helpers-utils';

const defaultFilterOptions = {
  year: () => getCurrentYear(),
  search: '',
  showOnlyUpcoming: true,
  showOnlyContactOrSignedUp: false,
  showOnlyAvailable: false,
  showOnlyUnpublished: false,
  states: [HelperTaskState.Pending],
};

const HelpersPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const firstHelperAppYear = 2023;
  const currentYear = getCurrentYear();

  const [year, setYear] = useState<number | null>(defaultFilterOptions.year());
  const [search, setSearch] = useState<string>(defaultFilterOptions.search);
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(
    defaultFilterOptions.showOnlyUpcoming
  );
  const [showOnlyContactOrSignedUp, setShowOnlyContactOrSignedUp] = useState(
    defaultFilterOptions.showOnlyContactOrSignedUp
  );
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(
    defaultFilterOptions.showOnlyAvailable
  );
  const [showOnlyUnpublished, setShowOnlyUnpublished] = useState(
    defaultFilterOptions.showOnlyUnpublished
  );
  const [states, setStates] = useState<HelperTaskState[]>(
    defaultFilterOptions.states
  );
  const allStates = {
    [HelperTaskState.Pending]: 'Pending',
    [HelperTaskState.Done]: `Done, but not validated ${doneEmoji}`,
    [HelperTaskState.Validated]: `Validated ${validatedEmoji}`,
  };

  const years = Array.from(
    {length: currentYear - firstHelperAppYear + 1},
    (_, i) => firstHelperAppYear + i
  );

  const onReset = () => {
    setYear(defaultFilterOptions.year());
    setSearch(defaultFilterOptions.search);
    setShowOnlyUpcoming(defaultFilterOptions.showOnlyUpcoming);
    setShowOnlyContactOrSignedUp(
      defaultFilterOptions.showOnlyContactOrSignedUp
    );
    setShowOnlyAvailable(defaultFilterOptions.showOnlyAvailable);
    setShowOnlyUnpublished(defaultFilterOptions.showOnlyUnpublished);
    setStates(defaultFilterOptions.states);
  };

  const onYearChange = (event: SelectChangeEvent) => {
    setYear(event.target.value === 'ALL' ? null : parseInt(event.target.value));
    setShowOnlyUpcoming(false);
  };

  const onSearch = useDelay(
    SEARCH_DELAY_MS,
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
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

    setStates(
      values.map(v => HelperTaskState[v as keyof typeof HelperTaskState])
    );
  };

  return (
    <>
      <PageTitleWithTaskActions value="Helper Tasks" />

      <Box>
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
                defaultValue={currentYear.toString()}
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
            value={states}
            onChange={handleStateChange}
            renderValue={values => (
              <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                {values.map(value => (
                  <Chip key={value} label={allStates[value]} />
                ))}
              </Box>
            )}
            size="small"
          >
            {Object.entries(allStates).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                <Checkbox
                  checked={states.indexOf(key as HelperTaskState) > -1}
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
                checked={showOnlyUpcoming}
                onChange={event =>
                  handleCheckboxChange(event, checked =>
                    setShowOnlyUpcoming(checked)
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
                checked={showOnlyContactOrSignedUp}
                onChange={event =>
                  handleCheckboxChange(event, checked => {
                    setShowOnlyContactOrSignedUp(checked);
                    if (checked) {
                      setShowOnlyAvailable(false);
                    }
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
                checked={showOnlyAvailable}
                onChange={event =>
                  handleCheckboxChange(event, checked => {
                    setShowOnlyAvailable(checked);
                    if (checked) {
                      setShowOnlyContactOrSignedUp(false);
                      setStates([HelperTaskState.Pending]);
                    }
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
                  checked={showOnlyUnpublished}
                  onChange={event =>
                    handleCheckboxChange(event, checked =>
                      setShowOnlyUnpublished(checked)
                    )
                  }
                  size="small"
                />
              }
              label="Only unpublished"
            />
          )}
        </Stack>
      </Box>

      <HelperTasksDataGrid
        filterOptions={{
          year,
          search,
          showOnlyUpcoming,
          showOnlyContactOrSignedUp,
          showOnlyAvailable,
          showOnlyUnpublished,
          states,
        }}
      />
    </>
  );
};

export default HelpersPage;
