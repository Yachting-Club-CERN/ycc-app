import { SxProps } from "@mui/material";
import Button, { ButtonProps } from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { JSX } from "react";

import { OpenConfirmationDialogProps } from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import { HelperTask } from "@/model/helpers-dtos";

type WithButtonProps = {
  buttonText?: string;
  buttonIcon?: never;
};

type WithIconButtonProps = {
  buttonText?: never;
  buttonIcon: JSX.Element;
};

type CommonProps = {
  buttonColor: ButtonProps["color"];
  buttonSx?: SxProps;

  dialogTitle: string;
  dialogContent: JSX.Element;
  dialogConfirmButtonColor?: ButtonProps["color"];
  dialogConfirmButtonText?: string;
  dialogCancelButtonColor?: ButtonProps["color"];
  dialogDelayConfirm?: boolean;

  onDialogOpening?: () => void;
  onDialogConfirm: () => Promise<HelperTask>;
  openConfirmationDialog: (props: OpenConfirmationDialogProps) => void;
  onTaskUpdate: (task: HelperTask) => void;
  onError: (error: unknown) => void;
};

type Props = (WithButtonProps | WithIconButtonProps) & CommonProps;

export type TaskActionProps = {
  task: HelperTask;
} & Pick<Props, "openConfirmationDialog" | "onTaskUpdate" | "onError">;

const TaskActionButton: React.FC<Props> = ({
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
}) => {
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
