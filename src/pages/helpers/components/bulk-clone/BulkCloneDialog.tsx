import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useCallback, useMemo, useState } from "react";

import RowStack from "@/components/layout/RowStack";
import SpacedBox from "@/components/layout/SpacedBox";
import { HelperTask, HelperTaskCreationRequest } from "@/model/helpers-dtos";
import { formatTime } from "@/utils/date-utils";
import dayjs from "@/utils/dayjs";

import DateChecklist from "./DateChecklist";
import { DAY_LABELS, DayOfWeek, generateDates } from "./generateDates";
import useBulkCreate from "./useBulkCreate";

type Props = {
  task: HelperTask;
  open: boolean;
  onClose: () => void;
  onCreateTask: (request: HelperTaskCreationRequest) => Promise<HelperTask>;
  onComplete: () => void;
};

const BulkCloneDialog = ({
  task,
  open,
  onClose,
  onCreateTask,
  onComplete,
}: Props): React.ReactNode => {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [excludedDates, setExcludedDates] = useState(new Set<string>());
  const { state: creationState, start: startCreation } = useBulkCreate(
    task,
    onCreateTask,
  );

  const generatedDates = useMemo(() => {
    if (!startDate || !endDate || selectedDays.length === 0) {
      return [];
    }
    if (endDate.isBefore(startDate)) {
      return [];
    }
    return generateDates(startDate, endDate, new Set(selectedDays));
  }, [startDate, endDate, selectedDays]);

  const includedDates = useMemo(
    () => generatedDates.filter((d) => !excludedDates.has(d.toISOString())),
    [generatedDates, excludedDates],
  );

  const resetExcluded = useCallback(() => {
    setExcludedDates(new Set());
  }, []);

  const toggleDate = useCallback((date: dayjs.Dayjs) => {
    const key = date.toISOString();
    setExcludedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const deselectAll = useCallback(() => {
    setExcludedDates(new Set(generatedDates.map((d) => d.toISOString())));
  }, [generatedDates]);

  const isCreating = creationState.status === "creating";
  const isDone = creationState.status === "done";
  const locked = isCreating || isDone;
  const hasPreview = generatedDates.length > 0;
  const canGenerate =
    selectedDays.length > 0 && startDate !== null && endDate !== null;

  const timeLabel =
    task.startsAt && task.endsAt
      ? `${formatTime(task.startsAt)} - ${formatTime(task.endsAt)}`
      : task.deadline
        ? `Deadline: ${formatTime(task.deadline)}`
        : "";

  return (
    <Dialog
      open={open}
      onClose={isCreating ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Clone to Multiple Dates</DialogTitle>

      <DialogContent>
        <SpacedBox>
          <Typography variant="subtitle2" gutterBottom>
            Source: {task.title}
            {timeLabel && (
              <>
                {" "}
                <Chip label={timeLabel} size="small" />
              </>
            )}
          </Typography>
        </SpacedBox>

        <SpacedBox>
          <Typography variant="subtitle2" gutterBottom>
            Days of the week
          </Typography>
          <ToggleButtonGroup
            value={selectedDays}
            onChange={(_, newDays: DayOfWeek[]) => {
              setSelectedDays(newDays);
              resetExcluded();
            }}
            disabled={locked}
          >
            {DAY_LABELS.map(({ day, label }) => (
              <ToggleButton key={day} value={day}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </SpacedBox>

        <SpacedBox>
          <RowStack wrap={true}>
            <DatePicker
              label="Start date"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                resetExcluded();
              }}
              disabled={locked}
            />
            <DatePicker
              label="End date"
              value={endDate}
              onChange={(value) => {
                setEndDate(value);
                resetExcluded();
              }}
              disabled={locked}
            />
          </RowStack>
        </SpacedBox>

        {canGenerate && !hasPreview && (
          <Alert severity="info">
            No dates match the selected days and date range.
          </Alert>
        )}

        {hasPreview && (
          <DateChecklist
            dates={generatedDates}
            excludedDates={excludedDates}
            onToggleDate={toggleDate}
            onSelectAll={resetExcluded}
            onDeselectAll={deselectAll}
            disabled={locked}
          />
        )}

        {isCreating && (
          <SpacedBox>
            <Typography variant="body2" gutterBottom>
              Creating shift {creationState.completed} of {creationState.total}
              ...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(creationState.completed / creationState.total) * 100}
            />
          </SpacedBox>
        )}

        {isDone && (
          <SpacedBox>
            <Alert severity={creationState.failed > 0 ? "warning" : "success"}>
              Created {creationState.created} shift
              {creationState.created !== 1 && "s"} successfully.
              {creationState.failed > 0 &&
                ` ${creationState.failed} failed — you can retry by cloning again.`}
            </Alert>
          </SpacedBox>
        )}
      </DialogContent>

      <DialogActions sx={{ pr: 3, pb: 2, pl: 3 }}>
        {!isDone && (
          <Button
            onClick={onClose}
            variant="text"
            color="error"
            disabled={isCreating}
          >
            Cancel
          </Button>
        )}
        {isDone ? (
          <Button onClick={onComplete} variant="contained">
            Done
          </Button>
        ) : (
          <Button
            onClick={() => {
              void startCreation(includedDates);
            }}
            variant="contained"
            disabled={includedDates.length === 0 || isCreating}
          >
            Create {includedDates.length} shift
            {includedDates.length !== 1 && "s"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkCloneDialog;
