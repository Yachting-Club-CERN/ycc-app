import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Hidden,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import {DateTimePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {
  LicenceDetailedInfos,
  LicenceInfos,
  MemberPublicInfos,
} from 'model/dtos';
import {
  HelperTaskCategories,
  HelperTaskCreationRequestDto,
} from 'model/helpers-dtos';
import React, {useContext, useState} from 'react';
import {useErrorBoundary} from 'react-error-boundary';
import {useForm} from 'react-hook-form';
import {
  AutocompleteElement,
  CheckboxElement,
  DateTimePickerElement,
  FormContainer,
  SelectElement,
  SwitchElement,
  TextFieldElement,
} from 'react-hook-form-mui';
import {useNavigate} from 'react-router-dom';

import ErrorAlert from '@app/components/ErrorAlert';
import AuthenticationContext from '@app/context/AuthenticationContext';
import SharedDataContext from '@app/context/SharedDataContext';
import usePromise from '@app/hooks/usePromise';
import client from '@app/utils/client';

// interface Props {
//   onSubmit: (data: HelperTaskCreationRequestDto) => void;
// }

type Props = {
  categories: HelperTaskCategories;
  members: MemberPublicInfos;
  licenceInfos: LicenceDetailedInfos;
};

const HelpersNewTaskFrom = ({categories, members, licenceInfos}: Props) => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<HelperTaskCreationRequestDto>();

  //   const handleFormSubmit = (data: HelperTaskCreationRequestDto) => {
  //     onSubmit(data);
  //   };

  const initialData: HelperTaskCreationRequestDto = {
    categoryId: -1,
    title: '',
    shortDescription: '',
    longDescription: null,
    contactId: currentUser.memberId,
    start: null,
    end: null,
    deadline: null,
    urgent: false,
    captainRequiredLicenceInfoId: -1,
    helpersMinCount: 1,
    helpersMaxCount: 2,
    published: false,
  };

  const onSubmit = async (data: HelperTaskCreationRequestDto) => {
    setSaving(true);
    try {
      setError(undefined);
      const dataToSend = {...data};
      if (dataToSend.captainRequiredLicenceInfoId === -1) {
        dataToSend.captainRequiredLicenceInfoId = null;
      }
      const task = await client.createHelperTask(dataToSend);
      navigate(`/helpers/tasks/${task.id}`);
    } catch (error) {
      setError(error);
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
    {
      id: -1,
      label: '(Select a category)',
    },
    ...categories.map(category => ({
      id: category.id,
      label: category.title,
    })),
  ];

  const memberOptions = members.map(member => ({
    id: member.id,
    label: `${member.lastName.toUpperCase()} ${member.firstName} (${
      member.username
    })`,
  }));

  const captainRequiredLicenceInfoOptions = [
    {
      id: -1,
      label: '(None)',
    },
    ...licenceInfos.map(licenceInfo => ({
      id: licenceInfo.id,
      label: `${licenceInfo.licence} (${licenceInfo.description})`,
    })),
  ];

  return (
    <>
      <FormContainer defaultValues={initialData} onSuccess={onSubmit}>
        <AutocompleteElement
          name="categoryId"
          label="Category"
          matchId
          options={categoryOptions}
        />
        <TextFieldElement name="title" required label="Title" />
        <TextFieldElement
          name="shortDescription"
          required
          label="Short Description"
        />
        <AutocompleteElement
          name="contactId"
          label="Contact"
          matchId
          options={memberOptions}
        />
        <Typography>
          You need to specify either the start and the end or a deadline.
        </Typography>
        <DateTimePickerElement name="start" label="Start" />
        <DateTimePickerElement name="end" label="End" />
        <DateTimePickerElement name="deadline" label="Deadline" />
        <AutocompleteElement
          name="captainRequiredLicenceInfoId"
          label="Captain required licence"
          matchId
          options={captainRequiredLicenceInfoOptions}
        />
        <TextFieldElement
          name="helpersMinCount"
          required
          label="Min. Helpers"
          type={'number'}
        />
        <TextFieldElement
          name="helpersMaxCount"
          required
          label="Max. Helpers"
          type={'number'}
        />
        <SwitchElement name="urgent" label="Urgent" labelPlacement="start" />
        <SwitchElement
          name="published"
          label="Published"
          labelPlacement="start"
        />

        <Button type="submit" variant="contained">
          Create
        </Button>
      </FormContainer>
      {error && <ErrorAlert error={error} />}

      <form
      //  onSubmit={handleSubmit(handleFormSubmit)}
      >
        <FormControl>
          {/* <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            id="category"
            label="Category"
            sx={{width: '20rem'}}
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.title}
              </MenuItem>
            ))}
          </Select> */}
        </FormControl>
        <TextField id="title" label="Title" sx={{width: '20rem'}} />
        <TextField
          id="shortDescription"
          label="Short Description"
          sx={{width: '20rem'}}
        />
        {currentUser.helpersAppAdmin && (
          <Autocomplete
            id="contact"
            autoComplete
            options={members}
            sx={{width: '20rem'}}
            getOptionLabel={member =>
              `${member.lastName.toUpperCase()} ${member.firstName} (${
                member.username
              })`
            }
            renderInput={params => <TextField {...params} label="Contact" />}
          />
        )}
        {!currentUser.helpersAppAdmin && (
          <>
            <TextField
              disabled
              id="contact"
              label="Contact"
              sx={{width: '20rem'}}
              value={`${currentUser.lastName.toUpperCase()} ${
                currentUser.firstName
              } (${currentUser.username})`}
            />
          </>
        )}
        TODO Type: shift / deadline TODO global LocalizationProvider
        {/* <LocalizationProvider dateAdapter={AdapterDayjs}> */}
        {/* <DateTimePicker
            // renderInput={props => <TextField {...props} />}
            label="Start"
            value={1}
            onChange={newValue => {
              setValue(newValue);
            }}
          /> */}
        {/* </LocalizationProvider> */}
        <Box>TODO</Box>
        {/* <TextField
          label="Category ID"
          type="number"
          error={Boolean(errors.categoryId)}
          helperText={errors.categoryId?.message}
          {...register('category_id', {required: 'Category ID is required'})}
        />
        <TextField
          label="Title"
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          {...register('title', {required: 'Title is required'})}
        />
        <TextField
          label="Short Description"
          error={Boolean(errors.shortDescription)}
          helperText={errors.shortDescription?.message}
          {...register('short_description', {
            required: 'Short Description is required',
          })}
        />
        <TextField
          label="Long Description"
          error={Boolean(errors.longDescription)}
          helperText={errors.longDescription?.message}
          {...register('long_description')}
        />
        <TextField
          label="Contact ID"
          type="number"
          error={Boolean(errors.contactId)}
          helperText={errors.contactId?.message}
          {...register('contact_id', {required: 'Contact ID is required'})}
        /> */}
        <TextField
          label="Start"
          type="date"
          error={Boolean(errors.start)}
          helperText={errors.start?.message}
          {...register('start')}
        />
        <TextField
          label="End"
          type="date"
          error={Boolean(errors.end)}
          helperText={errors.end?.message}
          {...register('end')}
        />
        <TextField
          label="Deadline"
          type="date"
          error={Boolean(errors.deadline)}
          helperText={errors.deadline?.message}
          {...register('deadline')}
        />
        <TextField
          label="Urgent"
          type="checkbox"
          error={Boolean(errors.urgent)}
          helperText={errors.urgent?.message}
          {...register('urgent', {required: 'Urgent is required'})}
        />
        {/* <TextField
          label="Captain Required Licence Info ID"
          type="number"
          error={Boolean(errors.captain_required_licence_info_id)}
          helperText={errors.captain_required_licence_info_id?.message}
          {...register('captain_required_licence_info_id')}
        />
        <TextField
          label="Minimum Number of Helpers"
          type="number"
          error={Boolean(errors.helpers_min_count)}
          helperText={errors.helpers_min_count?.message}
          {...register('helpers_min_count', {
            required: 'Minimum Number of Helpers is required',
          })}
        />
        <TextField
          label="Maximum Number of Helpers"
          type="number"
          error={Boolean(errors.helpers_max_count)}
          helperText={errors.helpers_max_count?.message}
          {...register('helpers_max_count', {
            required: 'Maximum Number of Helpers is required',
          })} */}
        {/* /> */}
        {/* <TextField
        label="Published"
        type="checkbox"
        error={Boolean(errors.published)}
        helperText={errors.published?.message}
        {...register('published', { */}
      </form>
    </>
  );
};

export default HelpersNewTaskFrom;
