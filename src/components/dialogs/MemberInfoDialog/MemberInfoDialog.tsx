import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import React from "react";

import EmailLink from "@/components/ui/links/EmailLink";
import PhoneLink from "@/components/ui/links/PhoneLink";
import { MemberPublicInfo } from "@/model/dtos";
import { getFullName } from "@/pages/members/members-utils";

type Props = {
  member: MemberPublicInfo | null;
  extra?: Record<string, string>;
  onClose: () => void;
};

const MemberInfoDialog: React.FC<Props> = ({ member, extra, onClose }) => {
  return (
    <Dialog
      open={!!member}
      onClose={onClose}
      maxWidth="sm"
      className="ycc-member-info-dialog"
    >
      {member && (
        <>
          <DialogTitle>{getFullName(member)}</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              pb: 0,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Email:
            </Typography>
            <Typography>
              <EmailLink email={member.email} />
            </Typography>
            {member.mobilePhone && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" mt={2}>
                  Mobile Phone:
                </Typography>
                <Typography>
                  <PhoneLink phone={member.mobilePhone} />
                </Typography>
              </>
            )}
            {member.homePhone && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" mt={2}>
                  Home Phone:
                </Typography>
                <Typography>
                  <PhoneLink phone={member.homePhone} />
                </Typography>
              </>
            )}
            {member.workPhone && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" mt={2}>
                  Work Phone:
                </Typography>
                <Typography>
                  <PhoneLink phone={member.workPhone} />
                </Typography>
              </>
            )}
            <Typography variant="subtitle1" fontWeight="bold" mt={2}>
              Username:
            </Typography>
            <Typography>{member.username}</Typography>
            {extra &&
              Object.entries(extra).map(([key, value]) => (
                <React.Fragment key={key}>
                  <Typography variant="subtitle1" fontWeight="bold" mt={2}>
                    {key}:
                  </Typography>
                  <Typography>{value}</Typography>
                </React.Fragment>
              ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default MemberInfoDialog;
