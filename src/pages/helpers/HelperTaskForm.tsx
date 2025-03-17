import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useContext, useEffect, useState } from "react";
import {
  AutocompleteElement,
  FormContainer,
  SwitchElement,
  TextFieldElement,
} from "react-hook-form-mui";
import {
  DateTimePickerElement,
  TimePickerElement,
} from "react-hook-form-mui/date-pickers";
import { useNavigate } from "react-router-dom";

import { ConfirmationDialogContent } from "@/components/ConfirmationDialog";
import ErrorAlert from "@/components/ErrorAlert";
import RichTextEditor from "@/components/RichTextEditor";
import SpacedBox from "@/components/SpacedBox";
import SpacedTypography from "@/components/SpacedTypography";
import AuthenticationContext from "@/context/AuthenticationContext";
import useConfirmationDialog from "@/hooks/useConfirmationDialog";
import useDelayedRef from "@/hooks/useDelayedRef";
import { LicenceDetailedInfos, MemberPublicInfos } from "@/model/dtos";
import {
  HelperTask,
  HelperTaskCategories,
  HelperTaskMutationRequestDto,
  HelperTaskType,
} from "@/model/helpers-dtos";
import client from "@/utils/client";
import dayjs from "@/utils/dayjs";

import { canEditTask, getTaskLocation, isMultiDayShift } from "./helpers-utils";

type Props = {
  task?: HelperTask;
  newTask: boolean;
  categories: HelperTaskCategories;
  members: MemberPublicInfos;
  licenceInfos: LicenceDetailedInfos;
};

type HelperTaskFormData = HelperTaskMutationRequestDto & {
  endsAtTime: dayjs.Dayjs | null;
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
    task?.longDescription,
  );
  const [type, setType] = useState(task?.type ?? HelperTaskType.Shift);
  const [multiDayShift, setMultiDayShift] = useState(
    task ? isMultiDayShift(task) : false,
  );
  const { confirmationDialogComponent, openConfirmationDialog } =
    useConfirmationDialog();

  const navigate = useNavigate();
  // Some components may be already loaded at this point
  useEffect(() => {
    if (task && !newTask && !canEditTask(task, currentUser)) {
      alert(
        "Hello there! No idea how you got here! You cannot edit this task, sorry :-(",
      );
      void navigate(getTaskLocation(task.id));
    }
  }, [task, newTask, currentUser]);

  const initialData: HelperTaskFormData = {
    categoryId: task?.category.id ?? -1,
    title: task?.title ?? "",
    shortDescription: task?.shortDescription ?? "",
    longDescription: task?.longDescription ?? null,
    contactId: newTask
      ? currentUser.memberId
      : (task?.contact.id ?? currentUser.memberId),
    startsAt: task?.startsAt ?? null,
    endsAt: task?.endsAt ?? null,
    endsAtTime: task?.endsAt ?? null,
    deadline: task?.deadline ?? null,
    urgent: task?.urgent ?? false,
    captainRequiredLicenceInfoId: task?.captainRequiredLicenceInfo?.id ?? -1,
    helperMinCount: task?.helperMinCount ?? 1,
    helperMaxCount: task?.helperMaxCount ?? 2,
    published: task?.published ?? true,
  };

  const onTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: HelperTaskType | null,
  ) => {
    if (newType !== null) {
      setType(newType);
    }
  };

  const doSubmit = async (dataToSend: HelperTaskMutationRequestDto) => {
    const mutatedTask =
      task && !newTask
        ? await client.updateHelperTask(task.id, dataToSend)
        : await client.createHelperTask(dataToSend);
    await navigate(getTaskLocation(mutatedTask.id));
  };

  const onSubmit = async (data: HelperTaskFormData) => {
    try {
      setError(undefined);
      const { endsAtTime, ...dataToSend } = { ...data };

      dataToSend.longDescription = longDescription.get() ?? null;
      if (dataToSend.captainRequiredLicenceInfoId === -1) {
        dataToSend.captainRequiredLicenceInfoId = null;
      }

      if (!multiDayShift && dataToSend.startsAt && endsAtTime) {
        dataToSend.endsAt = endsAtTime
          .year(dataToSend.startsAt.year())
          .month(dataToSend.startsAt.month())
          .date(dataToSend.startsAt.date());
      }

      if (type === HelperTaskType.Shift) {
        dataToSend.deadline = null;
      } else if (type === HelperTaskType.Deadline) {
        dataToSend.startsAt = null;
        dataToSend.endsAt = null;
      }

      const confirmations = [];
      const wasMultiDayShift =
        (task ? isMultiDayShift(task) : false) && !newTask;
      if (!wasMultiDayShift && isMultiDayShift(dataToSend)) {
        confirmations.push(
          "Are you sure that this task is a multi-day shift and not a task with a deadline? Please note that members will not be able to sign up for multi-day shifts after the shift has started.",
        );
      }
      if (!dataToSend.published) {
        confirmations.push(
          "Are you sure you want this task to be unpublished?",
        );
      }

      if (confirmations.length > 0) {
        openConfirmationDialog(
          "Please confirm the following",
          confirmations as ConfirmationDialogContent,
          async () => {
            await doSubmit(dataToSend);
          },
        );
      } else {
        await doSubmit(dataToSend);
      }
    } catch (error) {
      setError(error);
    }
  };

  const categoryOptions = [
    {
      id: -1,
      label: "(Select a category)",
    },
    ...categories.map((category) => ({
      id: category.id,
      label: category.title,
    })),
  ];

  const memberOptions = members.map((member) => ({
    id: member.id,
    label: `${member.lastName.toUpperCase()} ${member.firstName} (${
      member.username
    })`,
  }));

  const captainRequiredLicenceInfoOptions = [
    {
      id: -1,
      label: "(None)",
    },
    ...licenceInfos.map((licenceInfo) => ({
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
            task ? task.longDescription : "<p>Please describe the task here</p>"
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
          {/* This is not controlled by the FormContainer */}
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
              {multiDayShift ? (
                <DateTimePickerElement
                  name="endsAt"
                  label="End"
                  className="ycc-helper-task-ends-at-input"
                  timezone="default"
                />
              ) : (
                <TimePickerElement
                  name="endsAtTime"
                  label="End"
                  className="ycc-helper-task-ends-at-time-input"
                  timezone="default"
                  sx={{ width: "7.5rem" }}
                />
              )}
              {/* This is not controlled by the FormContainer */}
              <FormControlLabel
                control={
                  <Switch
                    checked={multiDayShift}
                    onChange={(_, checked) => setMultiDayShift(checked)}
                  />
                }
                label="Multi-Day shift"
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
                minWidth: "15rem",
                maxWidth: "20rem",
              },
            }}
          />
          <TextFieldElement
            name="helperMinCount"
            required
            label="Min. Helpers"
            type={"number"}
            slotProps={{
              input: {
                sx: {
                  textAlign: "center",
                  width: "5rem",
                },
              },
            }}
          />
          <TextFieldElement
            name="helperMaxCount"
            required
            label="Max. Helpers"
            type={"number"}
            slotProps={{
              input: {
                sx: {
                  textAlign: "center",
                  width: "5rem",
                },
              },
            }}
          />
        </Stack>
      </SpacedBox>
      <Divider sx={{ mt: 2 }} />
      <SpacedTypography>
        Urgent tasks are highlighted at the top of the table, unpublished tasks
        are not shown to club members. After a member signs up for a task, you
        will be limited in modifications (e.g, you cannot change the timing).
      </SpacedTypography>
      <SpacedBox>
        <Stack direction="row" spacing={2} justifyContent="center">
          <SwitchElement name="urgent" label="Urgent" />
          <SwitchElement name="published" label="Published" />

          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Stack>
      </SpacedBox>
      <SpacedBox>
        <>{error && <ErrorAlert error={error} />}</>
      </SpacedBox>

      {confirmationDialogComponent}
    </FormContainer>
  );
};

export default HelperTaskForm;
