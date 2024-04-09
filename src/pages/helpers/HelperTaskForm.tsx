import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {LicenceDetailedInfos, MemberPublicInfos} from 'model/dtos';
import {
  HelperTask,
  HelperTaskCategories,
  HelperTaskMutationRequestDto,
  HelperTaskType,
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
import useDelayedRef from '@app/hooks/useDelayedRef';
import client from '@app/utils/client';

import {canEditTask, getTaskLocation} from './helpers-utils';

type Props = {
  task?: HelperTask;
  newTask: boolean;
  categories: HelperTaskCategories;
  members: MemberPublicInfos;
  licenceInfos: LicenceDetailedInfos;
};

const HelperTaskForm = ({
  task,
  newTask,
  categories,
  members,
  licenceInfos,
}: Props) => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const [error, setError] = useState<unknown>();
  const longDescription = useDelayedRef<string | null | undefined>(
    task?.longDescription
  );
  const [type, setType] = useState(task?.type ?? HelperTaskType.Shift);

  const navigate = useNavigate();
  // Some components may be already loaded at this point
  useEffect(() => {
    if (task && !newTask && !canEditTask(task, currentUser)) {
      alert(
        'Hello there! No idea how you got here! You cannot edit this task, sorry :-('
      );
      navigate(getTaskLocation(task.id));
    }
  });

  const initialData: HelperTaskMutationRequestDto = {
    categoryId: task?.category.id ?? -1,
    title: task?.title ?? '',
    shortDescription: task?.shortDescription ?? '',
    longDescription: task?.longDescription ?? null,
    contactId: newTask
      ? currentUser.memberId
      : task?.contact.id ?? currentUser.memberId,
    startsAt: task?.startsAt ?? null,
    endsAt: task?.endsAt ?? null,
    deadline: task?.deadline ?? null,
    urgent: task?.urgent ?? false,
    captainRequiredLicenceInfoId: task?.captainRequiredLicenceInfo?.id ?? -1,
    helperMinCount: task?.helperMinCount ?? 1,
    helperMaxCount: task?.helperMaxCount ?? 2,
    published: true,
  };

  const onTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: HelperTaskType | null
  ) => {
    if (newType !== null) {
      setType(newType);
    }
  };

  const onSubmit = async (data: HelperTaskMutationRequestDto) => {
    try {
      setError(undefined);
      const dataToSend = {...data};

      dataToSend.longDescription = longDescription.get() ?? null;
      if (dataToSend.captainRequiredLicenceInfoId === -1) {
        dataToSend.captainRequiredLicenceInfoId = null;
      }

      if (type === HelperTaskType.Shift) {
        dataToSend.deadline = null;
      } else if (type === HelperTaskType.Deadline) {
        dataToSend.startsAt = null;
        dataToSend.endsAt = null;
      }

      const mutatedTask =
        task && !newTask
          ? await client.updateHelperTask(task.id, dataToSend)
          : await client.createHelperTask(dataToSend);
      navigate(getTaskLocation(mutatedTask.id));
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
          initialContent={
            task ? task.longDescription : '<p>Please describe the task here</p>'
          }
          onBlur={longDescription.setImmediately}
          onInit={longDescription.setImmediately}
          onChange={longDescription.setWithDelay}
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

      <SpacedBox>
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            color="primary"
            value={type}
            exclusive
            onChange={onTypeChange}
          >
            <ToggleButton value={HelperTaskType.Shift}>Shift</ToggleButton>
            <ToggleButton value={HelperTaskType.Deadline}>
              Deadline
            </ToggleButton>
          </ToggleButtonGroup>

          {type === HelperTaskType.Shift && (
            <>
              <DateTimePickerElement
                name="startsAt"
                label="Start"
                className="ycc-helper-task-starts-at-input"
                timezone="default"
              />
              <DateTimePickerElement
                name="endsAt"
                label="End"
                className="ycc-helper-task-ends-at-input"
                timezone="default"
              />
            </>
          )}
          {type === HelperTaskType.Deadline && (
            <DateTimePickerElement
              name="deadline"
              label="Deadline"
              className="ycc-helper-task-deadline-input"
              timezone="default"
            />
          )}
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

export default HelperTaskForm;
