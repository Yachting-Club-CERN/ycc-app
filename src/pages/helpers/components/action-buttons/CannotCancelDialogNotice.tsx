import DialogContentText from "@mui/material/DialogContentText";

const CannotCancelDialogNotice: React.FC = () => (
  <DialogContentText mb={2}>
    After signing up <strong>you CANNOT cancel</strong> unless you provide a
    replacement!
  </DialogContentText>
);

export default CannotCancelDialogNotice;
