import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {MemberPublicInfo} from 'model/dtos';
import React from 'react';

import {toEmailLink, toTelLink} from '@app/components/links';

type Params = {
  member?: MemberPublicInfo | null;
  onClose: () => void;
};

const MemberInfoDialog = ({member, onClose}: Params) => {
  return (
    <Dialog
      open={!!member}
      onClose={onClose}
      maxWidth="sm"
      className="ycc-member-info-dialog"
    >
      {member && (
        <>
          <DialogTitle>{`${member.firstName} ${member.lastName}`}</DialogTitle>
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
            <Typography>{toEmailLink(member.email) || '-'}</Typography>
            {member.mobilePhone && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{fontWeight: 'bold', mt: 2}}
                >
                  Mobile Phone:
                </Typography>
                <Typography>{toTelLink(member.mobilePhone)}</Typography>
              </>
            )}
            {member.homePhone && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{fontWeight: 'bold', mt: 2}}
                >
                  Home Phone:
                </Typography>
                <Typography>{toTelLink(member.homePhone)}</Typography>
              </>
            )}
            {member.workPhone && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{fontWeight: 'bold', mt: 2}}
                >
                  Work Phone:
                </Typography>
                <Typography>{toTelLink(member.workPhone)}</Typography>
              </>
            )}
            <Typography variant="subtitle1" sx={{fontWeight: 'bold', mt: 2}}>
              Username:
            </Typography>
            <Typography>{member.username}</Typography>
            <Button onClick={onClose} sx={{m: 2}}>
              Close
            </Button>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default MemberInfoDialog;
