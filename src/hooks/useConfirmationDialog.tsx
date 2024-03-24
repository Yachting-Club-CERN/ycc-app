import {useState} from 'react';
import React from 'react';

import ConfirmationDialog, {
  ConfirmationDialogContent,
} from '@app/components/ConfirmationDialog';

/**
 * Hook to open a confirmation dialog. Creates a `useState()` hook under the hood.
 *
 * Usage:
 * 1. Call the hook
 * 2. Render the returned component
 * 3. Call the returned function to open the dialog
 *
 * @returns the component to render and the function to call to open the dialog
 */
// TODO Global render?
const useConfirmationDialog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ConfirmationDialogContent>('');

  const [open, setOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState(() => () => {}); // Keep callback as state

  const openConfirmationDialog = (
    title: string,
    content: ConfirmationDialogContent,
    onConfirm: () => void
  ) => {
    setTitle(title);
    setContent(content);
    setOpen(true);
    setOnConfirm(() => onConfirm); // Keep callback as state
  };

  const confirmationDialogComponent = (
    <ConfirmationDialog
      title={title}
      content={content}
      open={open}
      onConfirm={() => {
        onConfirm();
        setOpen(false);
      }}
      onClose={() => setOpen(false)}
    />
  );

  return {
    confirmationDialogComponent,
    openConfirmationDialog,
  };
};

export default useConfirmationDialog;
