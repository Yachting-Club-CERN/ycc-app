import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import RowStack from "@/components/layout/RowStack";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { useNavigate } from "@/hooks/useNavigate";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";
import { YCC_COMMITTEE_EMAIL_ADDRESS } from "@/utils/constants";
import { mailtoHref } from "@/utils/utils";

import PermissionsDataGrid from "./PermissionsDataGrid";

const PermissionsPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const permissions = usePromise(client.helpers.getPermissions);

  const navigate = useNavigate();
  if (!currentUser.helpersAppAdmin) {
    void navigate("/");
  }

  const handleClick = (): void => {
    if (!permissions.result) {
      return;
    }

    const to =
      `${YCC_COMMITTEE_EMAIL_ADDRESS},` +
      permissions.result.map((permission) => permission.member.email).join(",");

    const plainTextBody = `Dear Sailors ⛵️🥳,



Fair Winds,
${currentUser.firstName}`;

    const htmlBody = `Dear Sailors ⛵️🥳,
<br /><br />

<br /><br />
Fair Winds,<br />
${currentUser.firstName}`;

    window.location.href = mailtoHref({
      to,
      plainTextBody,
      htmlBody,
    });
  };

  return (
    <>
      <PageTitle value="Permissions" />

      {permissions.result && (
        <>
          <RowStack wrap={true} mb={2}>
            <Typography>
              Currently {permissions.result.length} members have permissions to
              manage helper tasks.{" "}
            </Typography>
            <Button variant="contained" onClick={handleClick}>
              Send them an email
            </Button>
          </RowStack>
          <PermissionsDataGrid permissions={permissions.result} />
        </>
      )}

      <PromiseStatus outcomes={[permissions]} />
    </>
  );
};

export default PermissionsPage;
