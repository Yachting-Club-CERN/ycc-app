import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import {LicenceDetailedInfos, MemberPublicInfos} from 'model/dtos';
import {
  HelperTask,
  HelperTaskCategories,
  HelperTaskMutationRequestDto,
} from 'model/helpers-dtos';
import React, {useContext, useEffect, useState} from 'react';
import {
  AutocompleteElement,
  DateTimePickerElement,
  FormContainer,
  SwitchElement,
  TextFieldElement,
} from 'react-hook-form-mui';
import {useNavigate} from 'react-router-dom';

import ErrorAlert from '@app/components/ErrorAlert';
import RichTextEditor from '@app/components/RichTextEditor';
import SpacedBox from '@app/components/SpacedBox';
import SpacedTypography from '@app/components/SpacedTypography';
import AuthenticationContext from '@app/context/AuthenticationContext';
import useDelay from '@app/hooks/useDelay';
import client from '@app/utils/client';
import {sanitiseInputDate} from '@app/utils/date-utils';

import {canEditTask} from './helpers-utils';

type Props = {
  task?: HelperTask;
  categories: HelperTaskCategories;
  members: MemberPublicInfos;
  licenceInfos: LicenceDetailedInfos;
};

const HelpersTaskForm = ({task, categories, members, licenceInfos}: Props) => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const [error, setError] = useState<unknown>();
  const [longDescription, setLongDescriptionImmediately] = useState(
    task?.longDescription
  );
  const setLongDescriptionWithDelay = useDelay(
    500,
    setLongDescriptionImmediately
  );
  const navigate = useNavigate();
  // Some components may be already loaded at this point
  useEffect(() => {
    if (task && !canEditTask(task, currentUser)) {
      alert(
        'Hello there! No idea how you got here! You cannot edit this task, sorry :-('
      );
      navigate(`/helpers/tasks/${task.id}`);
    }
  });

  const initialData: HelperTaskMutationRequestDto = {
    categoryId: task?.category.id ?? -1,
    title: task?.title ?? '',
    shortDescription: task?.shortDescription ?? '',
    longDescription: task?.longDescription ?? null,
    contactId: task?.contact.id ?? currentUser.memberId,
    startsAt: task?.startsAt ?? null,
    endsAt: task?.endsAt ?? null,
    deadline: task?.deadline ?? null,
    urgent: task?.urgent ?? false,
    captainRequiredLicenceInfoId: task?.captainRequiredLicenceInfo?.id ?? -1,
    helperMinCount: task?.helperMinCount ?? 1,
    helperMaxCount: task?.helperMaxCount ?? 2,
    published: true,
  };

  const onSubmit = async (data: HelperTaskMutationRequestDto) => {
    // TODO #20 This is very basic
    try {
      setError(undefined);
      const dataToSend = {...data};
      dataToSend.longDescription = longDescription;
      dataToSend.startsAt = sanitiseInputDate(dataToSend.startsAt);
      dataToSend.endsAt = sanitiseInputDate(dataToSend.endsAt);
      dataToSend.deadline = sanitiseInputDate(dataToSend.deadline);
      if (dataToSend.captainRequiredLicenceInfoId === -1) {
        dataToSend.captainRequiredLicenceInfoId = null;
      }

      const mutatedTask = task
        ? await client.updateHelperTask(task.id, dataToSend)
        : await client.createHelperTask(dataToSend);
      navigate(`/helpers/tasks/${mutatedTask.id}`);
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
    <FormContainer defaultValues={initialData} onSuccess={onSubmit}>
      <SpacedTypography>
        Here you can create/edit a helper task. This can be a surveillance
        shift, a maintenance task, a regatta helper shift, etc.
      </SpacedTypography>

      <SpacedTypography>
        Please carefully read all the descriptions on this page if it is the
        first time you use this form. Submitted data can be immediately exposed
        to all members.
      </SpacedTypography>

      <SpacedTypography variant="h3">General</SpacedTypography>

      <SpacedTypography>
        If you need a new category please let Lajos know.
      </SpacedTypography>

      <SpacedBox>
        <AutocompleteElement
          name="categoryId"
          label="Category"
          matchId
          options={categoryOptions}
        />
      </SpacedBox>

      <SpacedBox>
        <TextFieldElement name="title" required label="Title" fullWidth />
      </SpacedBox>

      <SpacedBox>
        <TextFieldElement
          name="shortDescription"
          required
          label="Short Description"
          fullWidth
        />
      </SpacedBox>

      <SpacedBox>
        <RichTextEditor
          initialContent={task?.longDescription}
          onBlur={setLongDescriptionImmediately}
          onInit={setLongDescriptionImmediately}
          onChange={setLongDescriptionWithDelay}
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
          <DateTimePickerElement name="startsAt" label="Start" />
          <DateTimePickerElement name="endsAt" label="End" />
          <DateTimePickerElement name="deadline" label="Deadline" />
        </Stack>
      </SpacedBox>

      <SpacedTypography variant="h3">Helpers</SpacedTypography>

      <SpacedTypography>
        Every task needs a captain and the specified minimum and maximum number
        of helpers. The captain is responsible for coordinating the task. For
        example you might want to create a task &quot;Clean &amp; organise Mic
        Mac cockpit&quot; with a deadline, you can set a SU key requirement for
        the captain and the number of helpers to 1-2. This would mean that you
        would have 2-3 volunteers and you can delegate the task completely.
      </SpacedTypography>

      <SpacedTypography>
        If you personally plan to coordinate the task, you can later sign up for
        the task as captain.
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
            name="helperMinCount"
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
            name="helperMaxCount"
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
        Urgent tasks are highlighted at the top of the table, unpublished tasks
        are not shown to club members. After a member signs up for a task, you
        will be limited in modifications (e.g, you cannot change the timing).
      </SpacedTypography>
      <SpacedBox>
        <Stack direction="row" spacing={2} justifyContent="center">
          <SwitchElement name="urgent" label="Urgent" labelPlacement="start" />
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
  );
};

export default HelpersTaskForm;
