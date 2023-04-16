import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import {LicenceDetailedInfos, MemberPublicInfos} from 'model/dtos';
import {
  HelperTaskCategories,
  HelperTaskCreationRequestDto,
} from 'model/helpers-dtos';
import React, {useContext, useState} from 'react';
import {
  AutocompleteElement,
  DateTimePickerElement,
  FormContainer,
  SwitchElement,
  TextFieldElement,
} from 'react-hook-form-mui';
import {useNavigate} from 'react-router-dom';

import ErrorAlert from '@app/components/ErrorAlert';
import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
import SpacedBox from '@app/components/SpacedBox';
import SpacedTypography from '@app/components/SpacedTypography';
import AuthenticationContext from '@app/context/AuthenticationContext';
import client from '@app/utils/client';

type Props = {
  categories: HelperTaskCategories;
  members: MemberPublicInfos;
  licenceInfos: LicenceDetailedInfos;
};

const HelpersNewTaskFrom = ({categories, members, licenceInfos}: Props) => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const [error, setError] = useState<unknown>();
  const navigate = useNavigate();

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
    // TODO #20 This is very basic
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
    <ReadingFriendlyBox>
      <FormContainer defaultValues={initialData} onSuccess={onSubmit}>
        <SpacedTypography>
          Here you can create a new helper task. This can be a surveillance
          shift, a maintenance task, a regatta helper shift, etc.
        </SpacedTypography>

        <SpacedTypography variant="h3">General</SpacedTypography>

        <SpacedTypography>
          If you need a new category contact Lajos.
        </SpacedTypography>

        <SpacedBox minWidth={400}>
          <AutocompleteElement
            name="categoryId"
            label="Category"
            matchId
            options={categoryOptions}
          />
        </SpacedBox>

        <SpacedBox minWidth={400}>
          <TextFieldElement name="title" required label="Title" fullWidth />
        </SpacedBox>

        <SpacedBox minWidth={400} maxWidth={800}>
          <TextFieldElement
            name="shortDescription"
            required
            label="Short Description"
            fullWidth
          />
        </SpacedBox>

        {currentUser.helpersAppAdmin ? (
          <AutocompleteElement
            name="contactId"
            label="Contact"
            matchId
            options={memberOptions}
          />
        ) : (
          <SpacedTypography variant="subtitle2">
            You will be marked as contact for this task.
          </SpacedTypography>
        )}

        <SpacedTypography variant="h3">Timing</SpacedTypography>
        <SpacedTypography variant="subtitle1">
          You need to specify either both start and end <em>or</em> a deadline.
        </SpacedTypography>
        <SpacedBox>
          <Stack direction="row" spacing={2} justifyContent="center">
            <DateTimePickerElement name="start" label="Start" />
            <DateTimePickerElement name="end" label="End" />
            <DateTimePickerElement name="deadline" label="Deadline" />
          </Stack>
        </SpacedBox>

        <SpacedTypography variant="h3">Helpers</SpacedTypography>

        <SpacedTypography>
          Every task needs a captain and the specified minimum and maximum
          number of helpers. The captain is responsible for coordinating the
          task. For example you might want to create a task &quot;Clean &amp;
          organise Mic Mac cockpit&quot; with a deadline, you can set a SU key
          requirement for the captain and number of helpers to 1-2. This would
          mean that you would have 2-3 volunteers and you can delegate the task
          completely.
        </SpacedTypography>

        <SpacedTypography>
          If you personally plan to coordinate the task, you can later subscribe
          to the task as captain.
        </SpacedTypography>

        <SpacedBox>
          <Stack direction="row" spacing={2}>
            <AutocompleteElement
              name="captainRequiredLicenceInfoId"
              label="Captain required licence"
              matchId
              options={captainRequiredLicenceInfoOptions}
              textFieldProps={{
                sx: {
                  minWidth: '15rem',
                  maxWidth: '20rem',
                },
              }}
            />
            <TextFieldElement
              name="helpersMinCount"
              required
              label="Min. Helpers"
              type={'number'}
              inputProps={{
                sx: {
                  textAlign: 'center',
                  width: '5rem',
                },
              }}
            />
            <TextFieldElement
              name="helpersMaxCount"
              required
              label="Max. Helpers"
              type={'number'}
              inputProps={{
                sx: {
                  textAlign: 'center',
                  width: '5rem',
                },
              }}
            />
          </Stack>
        </SpacedBox>
        <Divider sx={{mt: 2}} />
        <SpacedTypography>
          Urgent tasks are highlighted at the top of the table, unpublished
          tasks are not shown to club members.
        </SpacedTypography>
        <SpacedBox>
          <Stack direction="row" spacing={2} justifyContent="center">
            <SwitchElement
              name="urgent"
              label="Urgent"
              labelPlacement="start"
            />
            <SwitchElement
              name="published"
              label="Published"
              labelPlacement="start"
            />

            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Stack>
        </SpacedBox>
        <SpacedBox>
          <>{error && <ErrorAlert error={error} />}</>
        </SpacedBox>
      </FormContainer>
    </ReadingFriendlyBox>
  );
};

export default HelpersNewTaskFrom;
