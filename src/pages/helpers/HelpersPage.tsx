import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, {useContext, useState} from 'react';

import SpacedTypography from '@app/components/SpacedTypography';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useDelay from '@app/hooks/useDelay';
import {SEARCH_DELAY_MS} from '@app/utils/search-utils';

import HelperTasksDataGrid from './HelperTasksDataGrid';
import PageTitleWithNewTaskButton from './PageTitleWithTaskActions';

const HelpersPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;

  const [search, setSearch] = useState<string>('');
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);
  const [showOnlyContactOrSignedUp, setShowOnlyContactOrSignedUp] =
    useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showOnlyUnpublished, setShowOnlyUnpublished] = useState(false);

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

  return (
    <>
      <PageTitleWithNewTaskButton value="Helper Tasks" />

      <SpacedTypography>
        On this page you can sign up for surveillance and maintenance tasks.
        Captain means Q-boat driver or the person who is organising the
        execution of the task.
      </SpacedTypography>

      <Stack direction="row" alignItems="center" spacing={1} mt={2} mb={2}>
        <Typography>Search:</Typography>
        <TextField
          onChange={onSearch}
          variant="outlined"
          label="Category, person, text..."
          size="small"
          sx={{
            width: 230,
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
              />
            }
            label="Only unpublished"
          />
        )}
      </Stack>

      <HelperTasksDataGrid
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
