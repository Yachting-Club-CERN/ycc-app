import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {MemberPublicInfo} from 'model/dtos';
import React from 'react';

import {toEmailLink, toTelLink} from '@app/components/links';

type Params = {
  selected?: MemberPublicInfo | null;
  handleClose: () => void;
};

const MembersDataGridDialog = ({selected, handleClose}: Params) => {
  return (
    <Dialog open={!!selected} onClose={handleClose} maxWidth="sm">
      {selected && (
        <>
          <DialogTitle>{`${selected.firstName} ${selected.lastName}`}</DialogTitle>
          <DialogContent
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>
              Email:
            </Typography>
            <Typography>{toEmailLink(selected.email) || '-'}</Typography>
            {selected.mobilePhone && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{fontWeight: 'bold', mt: 2}}
                >
                  Mobile Phone:
                </Typography>
                <Typography>{toTelLink(selected.mobilePhone)}</Typography>
              </>
            )}
            {selected.homePhone && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{fontWeight: 'bold', mt: 2}}
                >
                  Home Phone:
                </Typography>
                <Typography>{toTelLink(selected.homePhone)}</Typography>
              </>
            )}
            {selected.workPhone && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{fontWeight: 'bold', mt: 2}}
                >
                  Work Phone:
                </Typography>
                <Typography>{toTelLink(selected.workPhone)}</Typography>
              </>
            )}
            <Typography variant="subtitle1" sx={{fontWeight: 'bold', mt: 2}}>
              Username:
            </Typography>
            <Typography>{selected.username}</Typography>
            <Button onClick={handleClose} sx={{m: 2}}>
              Close
            </Button>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default MembersDataGridDialog;
