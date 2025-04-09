import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import React, { JSX, useEffect, useState } from "react";
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

import useConfirmationDialog from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import RowStack from "@/components/layout/RowStack";
import SpacedBox from "@/components/layout/SpacedBox";
import ErrorAlert from "@/components/ui/ErrorAlert";
import RichTextEditor from "@/components/ui/RichTextEditor/RichTextEditor";
import SpacedTypography from "@/components/ui/SpacedTypography";
import useCurrentUser from "@/context/auth/useCurrentUser";
import useDelayedRef from "@/hooks/useDelayedRef";
import { useNavigate } from "@/hooks/useNavigate";
import { LicenceDetailedInfo, MemberPublicInfo } from "@/model/dtos";
import {
  HelperTask,
  HelperTaskCategory,
  HelperTaskCreationRequest,
  HelperTaskMutationRequestBase,
  HelperTaskType,
  HelperTaskUpdateRequest,
} from "@/model/helpers-dtos";
import client from "@/utils/client";
import { getNow } from "@/utils/date-utils";
import dayjs from "@/utils/dayjs";

import { getFullNameAndUsername } from "../../members/members-utils";
import {
  canEdit,
  getTaskLocation,
  hasAnyoneSignedUp,
  isMultiDayShift,
} from "../helpers-utils";

type Props = {
  task?: HelperTask;
  newTask: boolean;
  categories: Readonly<HelperTaskCategory[]>;
  members: Readonly<MemberPublicInfo[]>;
  licenceInfos: Readonly<LicenceDetailedInfo[]>;
};

type HelperTaskCreationRequestExtra = Omit<
  HelperTaskCreationRequest,
  keyof HelperTaskMutationRequestBase
>;

type HelperTaskUpdateRequestExtra = Omit<
  HelperTaskUpdateRequest,
  keyof HelperTaskMutationRequestBase
>;

type HelperTaskFormData = {
  base: HelperTaskMutationRequestBase;

  creation: HelperTaskCreationRequestExtra;
  update: HelperTaskUpdateRequestExtra;

  uiOnly: {
    endsAtTime: dayjs.Dayjs | null;
  };
};

const HelperTaskForm: React.FC<Props> = ({
  task,
  newTask,
  categories,
  members,
  licenceInfos,
}) => {
  const currentUser = useCurrentUser();
  const [error, setError] = useState<unknown>();
  const longDescription = useDelayedRef<string | null | undefined>(
    task?.longDescription,
  );
  const [type, setType] = useState(task?.type ?? HelperTaskType.Shift);
  const [multiDayShift, setMultiDayShift] = useState(
    task ? isMultiDayShift(task) : false,
  );
  const confirmationDialog = useConfirmationDialog();

  const navigate = useNavigate();
  // Some components may already be loaded at this point
  useEffect(() => {
    if (task && !newTask && !canEdit(task, currentUser)) {
      alert(
        "Hello there! No idea how you got here! You cannot edit this task, sorry :-(",
      );
      void navigate(getTaskLocation(task.id));
    }
  }, [task, newTask, currentUser]);

  const initialData: HelperTaskFormData = {
    base: {
      categoryId: task?.category.id ?? -1,
      title: task?.title ?? "",
      shortDescription: task?.shortDescription ?? "",
      longDescription: task?.longDescription ?? null,
      contactId: newTask
        ? currentUser.memberId
        : (task?.contact.id ?? currentUser.memberId),
      startsAt: task?.startsAt ?? null,
      endsAt: task?.endsAt ?? null,
      deadline:
        task?.deadline ??
        dayjs()
          .add(2, "weeks")
          .set("hour", 20)
          .set("minute", 0)
          .set("second", 0),
      urgent: task?.urgent ?? false,
      captainRequiredLicenceInfoId: task?.captainRequiredLicenceInfo?.id ?? -1,
      helperMinCount: task?.helperMinCount ?? 1,
      helperMaxCount: task?.helperMaxCount ?? 2,
      published: task?.published ?? true,
    },
    creation: {},
    update: {
      notifySignedUpMembers: true,
    },
    uiOnly: {
      endsAtTime: task?.endsAt ?? null,
    },
  };

  const handleTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: HelperTaskType | null,
  ): void => {
    if (newType !== null) {
      setType(newType);
    }
  };

  const doSubmit = async (
    base: HelperTaskMutationRequestBase,
    creation: HelperTaskCreationRequestExtra,
    update: HelperTaskUpdateRequestExtra,
  ): Promise<void> => {
    try {
      const mutatedTask =
        !newTask && task
          ? await client.helpers.updateTask(task.id, {
              ...base,
              ...update,
            })
          : await client.helpers.createTask({
              ...base,
              ...creation,
            });

      await navigate(getTaskLocation(mutatedTask.id));
    } catch (error) {
      setError(error);
    }
  };

  const getConfirmations = (
    base: HelperTaskMutationRequestBase,
    update: HelperTaskUpdateRequestExtra,
  ): JSX.Element[] => {
    const confirmations: JSX.Element[] = [];

    if (!newTask) {
      confirmations.push(
        update.notifySignedUpMembers ? (
          <DialogContentText mb={2}>
            Are you sure <strong>you want to notify</strong> signed-up members
            about this change?
          </DialogContentText>
        ) : (
          <DialogContentText mb={2}>
            Are you sure <strong>you do NOT want to notify</strong> signed-up
            members about this change?
          </DialogContentText>
        ),
      );
    }

    const wasMultiDayShift = (task ? isMultiDayShift(task) : false) && !newTask;
    if (!wasMultiDayShift && isMultiDayShift(base)) {
      confirmations.push(
        <DialogContentText mb={2}>
          Are you sure that{" "}
          <strong>
            this task is a multi-day shift and NOT a task with a deadline
          </strong>
          {"?"} Please note that members will not be able to sign up for
          multi-day shifts after the shift has started.
        </DialogContentText>,
      );
    }

    const now = getNow();
    // Using the first meaningful date is good enough for the confirmation dialog
    const taskDate = [base.startsAt, base.endsAt, base.deadline].find(
      (value) => value !== null,
    );
    const taskYear = taskDate?.year();

    if (taskYear && taskYear !== now.year()) {
      confirmations.push(
        <DialogContentText mb={2}>
          Are you sure that{" "}
          <strong>this task is NOT in the current year</strong>
          {"?"}
        </DialogContentText>,
      );
    }

    if (taskDate?.isBefore(now)) {
      confirmations.push(
        <DialogContentText mb={2}>
          Are you sure that <strong>this task is in the past</strong>
          {"?"} Members cannot sign up for tasks in the past.
        </DialogContentText>,
      );
    }

    if (task?.validatedBy) {
      confirmations.push(
        <DialogContentText mb={2}>
          Are you sure that you want to{" "}
          <strong>modify this validated task</strong>
          {"?"}
        </DialogContentText>,
      );
    } else if (task?.markedAsDoneBy) {
      confirmations.push(
        <DialogContentText mb={2}>
          Are you sure you want to modify{" "}
          <strong>this task that has been marked as done</strong>
          {"?"}
        </DialogContentText>,
      );
    }

    if (!base.published) {
      confirmations.push(
        <DialogContentText mb={2}>
          Are you sure you want <strong>this task to be unpublished</strong>?
          Members do not see and cannot sign up for unpublished tasks.
        </DialogContentText>,
      );
    }

    return confirmations;
  };

  const handleSubmit = async (data: HelperTaskFormData): Promise<void> => {
    setError(undefined);
    const {
      base,
      creation,
      update,
      uiOnly: { endsAtTime },
    } = data;

    base.longDescription = longDescription.get() ?? null;
    if (base.captainRequiredLicenceInfoId === -1) {
      base.captainRequiredLicenceInfoId = null;
    }

    if (!multiDayShift && base.startsAt && endsAtTime) {
      base.endsAt = endsAtTime
        .year(base.startsAt.year())
        .month(base.startsAt.month())
        .date(base.startsAt.date());
    }

    if (type === HelperTaskType.Shift) {
      base.deadline = null;
    } else if (type === HelperTaskType.Deadline) {
      base.startsAt = null;
      base.endsAt = null;
    }

    const confirmations = getConfirmations(base, update);

    if (confirmations.length > 0) {
      const content = (
        <>
          {confirmations.map((confirmation, index) => (
            <React.Fragment key={index}>{confirmation}</React.Fragment>
          ))}
        </>
      );

      confirmationDialog.open({
        title: "Please confirm the following:",
        content,
        delayConfirm: true,
        onConfirm: async () => await doSubmit(base, creation, update),
      });
    } else {
      await doSubmit(base, creation, update);
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
    label: getFullNameAndUsername(member),
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

  const showUrgent = newTask || task?.validatedBy === null;
  const showPublished = newTask || (task && !hasAnyoneSignedUp(task));

  return (
    <FormContainer defaultValues={initialData} onSuccess={handleSubmit}>
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
        If you need a new category please let an admin know.
      </SpacedTypography>

      <SpacedBox>
        <AutocompleteElement
          name="base.categoryId"
          required
          label="Category"
          matchId
          options={categoryOptions}
        />
      </SpacedBox>

      <SpacedBox>
        <TextFieldElement name="base.title" required label="Title" fullWidth />
      </SpacedBox>

      <SpacedBox>
        <TextFieldElement
          name="base.shortDescription"
          required
          label="Short Description (included in emails)"
          fullWidth
        />
      </SpacedBox>

      <SpacedBox>
        <SpacedTypography fontWeight="bold">
          Long description (not included in emails):
        </SpacedTypography>
        <RichTextEditor
          placeholder="Please describe the task here."
          initialContent={task?.longDescription ?? undefined}
          minHeight={250}
          onBlur={longDescription.setImmediately}
          onCreate={longDescription.setImmediately}
          onUpdate={longDescription.setWithDelay}
        />
      </SpacedBox>

      {currentUser.helpersAppAdmin ? (
        <AutocompleteElement
          name="base.contactId"
          required
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

      {!newTask && type == HelperTaskType.Shift && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography>
            If you change the time of a task and some of the helpers are not
            available in the new time,{" "}
            <strong>they should be awarded the task</strong>
            {"."} If this is the case, the best is to:
          </Typography>
          <ol>
            <Typography>
              <li>Validate (and therefore close) the current task</li>
              <li>Create a new task (you can use the Clone functionality)</li>
            </Typography>
          </ol>
          <Typography>
            However, if you kindly ask members about the time change and they
            are available in the new time as well, feel free to go ahead editing
            the current task.
          </Typography>
        </Alert>
      )}

      <SpacedBox>
        <RowStack wrap={true}>
          {/* This is not controlled by the FormContainer */}
          <ToggleButtonGroup
            color="primary"
            value={type}
            exclusive
            onChange={handleTypeChange}
          >
            <ToggleButton value={HelperTaskType.Shift}>Shift</ToggleButton>
            <ToggleButton value={HelperTaskType.Deadline}>
              Deadline
            </ToggleButton>
          </ToggleButtonGroup>

          {type === HelperTaskType.Shift && (
            <>
              <DateTimePickerElement
                name="base.startsAt"
                required
                label="Start"
                className="ycc-helper-task-starts-at-input"
                timezone="default"
              />
              {multiDayShift ? (
                <DateTimePickerElement
                  name="base.endsAt"
                  required
                  label="End"
                  className="ycc-helper-task-ends-at-input"
                  timezone="default"
                />
              ) : (
                <TimePickerElement
                  name="uiOnly.endsAtTime"
                  required
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
                label="Multi-day shift"
              />
            </>
          )}
          {type === HelperTaskType.Deadline && (
            <DateTimePickerElement
              name="base.deadline"
              required
              label="Deadline"
              className="ycc-helper-task-deadline-input"
              timezone="default"
            />
          )}
        </RowStack>
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
        <RowStack wrap={true}>
          <AutocompleteElement
            name="base.captainRequiredLicenceInfoId"
            label="Captain Required Licence"
            matchId
            options={captainRequiredLicenceInfoOptions}
            textFieldProps={{
              sx: {
                minWidth: "15rem",
                maxWidth: "20rem",
              },
            }}
          />

          <RowStack wrap={false}>
            <TextFieldElement
              name="base.helperMinCount"
              required
              label="Min. Helpers"
              type={"number"}
              slotProps={{
                input: {
                  sx: {
                    textAlign: "center",
                    width: "6.5rem",
                  },
                },
              }}
            />
            <TextFieldElement
              name="base.helperMaxCount"
              required
              label="Max. Helpers"
              type={"number"}
              slotProps={{
                input: {
                  sx: {
                    textAlign: "center",
                    width: "6.5rem",
                  },
                },
              }}
            />
          </RowStack>
        </RowStack>
      </SpacedBox>
      <Divider sx={{ mt: 2 }} />
      <SpacedTypography>
        Urgent tasks are highlighted at the top of the table, unpublished tasks
        are not shown to club members. After a member signs up for a task, you
        will be limited in modifications (e.g, you cannot change the timing).
      </SpacedTypography>
      {!newTask && (
        <Alert severity="warning">
          <Typography>
            <strong>
              If you choose to notify signed-up members, they will be emailed
              about this change.
            </strong>{" "}
            It is recommended to do so if you change the time, location or
            requirements of the task. However, please do not use this for minor
            edits or typo fixes.
          </Typography>
        </Alert>
      )}
      <SpacedBox>
        <RowStack wrap={true} justifyContent="center">
          {showUrgent && <SwitchElement name="base.urgent" label="Urgent" />}
          {showPublished && (
            <SwitchElement name="base.published" label="Published" />
          )}

          {!newTask && (
            <SwitchElement
              name="update.notifySignedUpMembers"
              label="Notify signed-up members about this change"
            />
          )}

          <Button type="submit" variant="contained">
            Submit
          </Button>
        </RowStack>
      </SpacedBox>

      <>
        {error && (
          <SpacedBox>
            <ErrorAlert error={error} />
          </SpacedBox>
        )}
      </>

      {confirmationDialog.component}
    </FormContainer>
  );
};

export default HelperTaskForm;
