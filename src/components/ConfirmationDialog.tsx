import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import {FormContainer} from 'react-hook-form-mui';

type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

type StringOrElement = string | JSX.Element;

export type ConfirmationDialogContent =
  | StringOrElement
  | ArrayOneOrMore<StringOrElement>;

type Props = {
  title: string;
  content: ConfirmationDialogContent;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmationDialog = ({
  title,
  content,
  open,
  onConfirm,
  onClose,
}: Props) => {
  const items: ArrayOneOrMore<StringOrElement> = Array.isArray(content)
    ? content
    : [content];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      className="ycc-confirmation-dialog"
    >
      <FormContainer onSuccess={onConfirm}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {items.map((item, index) => {
            const lastItem = index === items.length - 1;

            if (typeof item === 'string') {
              return (
                <DialogContentText key={index} mb={lastItem ? 0 : 2}>
                  {item}
                </DialogContentText>
              );
            } else {
              return <React.Fragment key={index}>{item}</React.Fragment>;
            }
          })}
        </DialogContent>
        <DialogActions sx={{paddingBottom: 2, paddingRight: 2}}>
          <Button onClick={onClose} variant="text" color="error">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="success" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </FormContainer>
    </Dialog>
  );
};

export default ConfirmationDialog;
