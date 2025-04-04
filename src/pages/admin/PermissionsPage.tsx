import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import SpacedTypography from "@/components/ui/SpacedTypography";
import useCurrentUser from "@/context/auth/useCurrentUser";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";
import { YCC_COMMITTEE_EMAIL_ADDRESS } from "@/utils/constants";

import PermissionsDataGrid from "./PermissionsDataGrid";

const PermissionsPage = () => {
  const currentUser = useCurrentUser();
  const permissions = usePromise(client.helpers.getPermissions);

  const navigate = useNavigate();
  if (!currentUser.helpersAppAdmin) {
    void navigate("/");
  }

  const handleClick = () => {
    if (!permissions.result) {
      return;
    }

    const to =
      `${YCC_COMMITTEE_EMAIL_ADDRESS},` +
      permissions.result.map((permission) => permission.member.email).join(",");
    const subject = "Helper Task Management Permissions";

    const body = `Dear Sailors ⛵️🥳,
      <br /><br />
      
      <br /><br />
      Cheers,<br />
      ${currentUser.firstName} ${currentUser.lastName}`;

    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <PageTitle value="Permissions" />

      {permissions.result && (
        <>
          <SpacedTypography>
            Currently {permissions.result.length} members have permissions to
            manage helper tasks.{" "}
            <Button onClick={handleClick} variant="text">
              Email Them
            </Button>
          </SpacedTypography>
          <PermissionsDataGrid permissions={permissions.result} />
        </>
      )}

      <PromiseStatus outcomes={[permissions]} />
    </>
  );
};

export default PermissionsPage;
