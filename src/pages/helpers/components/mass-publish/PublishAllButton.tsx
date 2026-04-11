import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";

import useConfirmationDialog from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import { HelperTask } from "@/model/helpers-dtos";

import useMassPublish from "./useMassPublish";

type Props = {
  tasks: readonly HelperTask[];
  onComplete: () => void;
};

const PublishAllButton = ({ tasks, onComplete }: Props): React.ReactNode => {
  const { state, start, reset } = useMassPublish();
  const confirmationDialog = useConfirmationDialog();

  const unpublishedCount = tasks.filter((t) => !t.published).length;

  if (unpublishedCount === 0) {
    return null;
  }

  const handleClick = (): void => {
    confirmationDialog.open({
      title: "Publish all visible tasks?",
      content: (
        <DialogContentText>
          This will publish <strong>{unpublishedCount}</strong> unpublished task
          {unpublishedCount !== 1 && "s"}. Members will be able to see and sign
          up for them.
        </DialogContentText>
      ),
      onConfirm: async () => {
        try {
          await start(tasks, true);
        } finally {
          reset();
          onComplete();
        }
      },
    });
  };

  const isUpdating = state.status === "updating";

  const label = isUpdating
    ? `Publishing ${state.completed}/${state.total}...`
    : `Publish all (${unpublishedCount})`;

  return (
    <>
      <Button
        size="small"
        variant="contained"
        onClick={handleClick}
        disabled={isUpdating}
      >
        {label}
      </Button>

      {confirmationDialog.component}
    </>
  );
};

export default PublishAllButton;
