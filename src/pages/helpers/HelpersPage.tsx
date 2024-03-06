/* eslint-disable prettier/prettier */
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, {useContext, useState} from 'react';

import SpacedTypography from '@app/components/SpacedTypography';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useDelay from '@app/hooks/useDelay';
import {getCurrentYear} from '@app/utils/date-utils';
import {SEARCH_DELAY_MS} from '@app/utils/search-utils';

import HelperTasksDataGrid from './HelperTasksDataGrid';
import PageTitleWithNewAndCloneTaskButtons from './PageTitleWithTaskActions';

const HelpersPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const firstHelperAppYear = 2023;
  const currentYear = getCurrentYear();

  const [year, setYear] = useState<number | null>(currentYear);
  const [search, setSearch] = useState<string>('');
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);
  const [showOnlyContactOrSignedUp, setShowOnlyContactOrSignedUp] =
    useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showOnlyUnpublished, setShowOnlyUnpublished] = useState(false);

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

  const years = Array.from(
    {length: currentYear - firstHelperAppYear + 1},
    (_, i) => firstHelperAppYear + i
  );

  return (
    <>
      <PageTitleWithNewAndCloneTaskButtons value="Helper Tasks" />

      {/* TODO make the layout mobile friendly */}
      <Stack direction="row" alignItems="center" spacing={1} mt={2} mb={2}>
        {currentUser.helpersAppAdminOrEditor && (
          <>
            <SpacedTypography>Year:</SpacedTypography>
            <Select
              defaultValue={currentYear}
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
            height: 40,
            width: 200,
          }}
          className="ycc-helpers-search-input"
        />
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

      <HelperTasksDataGrid
        year={year}
        search={search}
        showOnlyUpcoming={showOnlyUpcoming}
        showOnlyContactOrSignedUp={showOnlyContactOrSignedUp}
        showOnlyAvailable={showOnlyAvailable}
        showOnlyUnpublished={showOnlyUnpublished}
      />
    </>
  );
};

export default HelpersPage;
