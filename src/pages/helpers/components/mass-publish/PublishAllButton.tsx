import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import { useMemo } from "react";

import useConfirmationDialog from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { HelperTask } from "@/model/helpers-dtos";
import { canEdit } from "@/pages/helpers/helpers-utils";

import useMassPublish from "./useMassPublish";

type Props = {
  tasks: readonly HelperTask[];
  onComplete: () => void;
};

const PublishAllButton = ({ tasks, onComplete }: Props): React.ReactNode => {
  const currentUser = useCurrentUser();
  const { state, start, reset } = useMassPublish();
  const confirmationDialog = useConfirmationDialog();

  const editableTasks = useMemo(
    () => tasks.filter((t) => canEdit(t, currentUser)),
    [tasks, currentUser],
  );
  const unpublishedCount = editableTasks.filter((t) => !t.published).length;

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
          await start(editableTasks, true);
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
