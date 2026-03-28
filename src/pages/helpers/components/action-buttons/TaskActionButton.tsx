import Button, { ButtonProps } from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { SxProps } from "@mui/material/styles";

import { OpenConfirmationDialogProps } from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import { HelperTask } from "@/model/helpers-dtos";

type WithButtonProps = {
  buttonText?: string | undefined;
  buttonIcon?: never | undefined;
};

type WithIconButtonProps = {
  buttonText?: never | undefined;
  buttonIcon: React.ReactNode;
};

type CommonProps = {
  buttonColor: ButtonProps["color"];
  buttonSx?: SxProps | undefined;

  dialogTitle: string;
  dialogContent: React.ReactElement | null; // No content has to be explicit
  dialogConfirmButtonColor?: ButtonProps["color"] | undefined;
  dialogConfirmButtonText?: string | undefined;
  dialogCancelButtonColor?: ButtonProps["color"] | undefined;
  dialogDelayConfirm?: boolean | undefined;

  onDialogOpening?: (() => void) | undefined;
  onDialogConfirm: () => Promise<HelperTask>;
  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  onTaskUpdate: (task: HelperTask) => void;
  onError: (error: unknown) => void;
};

type Props = (WithButtonProps | WithIconButtonProps) & CommonProps;

export type TaskActionProps = {
  task: HelperTask;
} & Pick<Props, "openConfirmationDialog" | "onTaskUpdate" | "onError">;

const TaskActionButton = ({
  buttonText,
  buttonIcon,
  buttonColor,
  buttonSx,
  dialogTitle,
  dialogContent,
  dialogConfirmButtonColor,
  dialogConfirmButtonText,
  dialogCancelButtonColor,
  dialogDelayConfirm,
  onDialogOpening,
  onDialogConfirm,
  openConfirmationDialog,
  onTaskUpdate: updateTask,
  onError,
}: Props): React.ReactNode => {
  const handleClick = (): void => {
    onError(undefined);
    if (onDialogOpening) {
      onDialogOpening();
    }

    openConfirmationDialog({
      title: dialogTitle,
      content: dialogContent,
      confirmButtonColor: dialogConfirmButtonColor,
      confirmButtonText: dialogConfirmButtonText ?? buttonText,
      cancelButtonColor: dialogCancelButtonColor,
      delayConfirm: dialogDelayConfirm,
      onConfirm: async () => {
        try {
          const updatedTask = await onDialogConfirm();
          updateTask(updatedTask);
        } catch (ex) {
          onError(ex);
        }
      },
    });
  };

  return buttonIcon ? (
    <IconButton color={buttonColor} sx={buttonSx} onClick={handleClick}>
      {buttonIcon}
    </IconButton>
  ) : (
    <Button
      variant="contained"
      color={buttonColor}
      onClick={handleClick}
      sx={buttonSx}
    >
      {buttonText}
    </Button>
  );
};

export default TaskActionButton;
