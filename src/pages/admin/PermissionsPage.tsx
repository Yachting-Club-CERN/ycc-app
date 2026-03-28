import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import ReadingBoxLarge from "@/components/layout/ReadingBoxLarge";
import RowStack from "@/components/layout/RowStack";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useCurrentUser from "@/context/auth/useCurrentUser";
import usePromise from "@/hooks/usePromise";
import { HelpersAppPermission } from "@/model/helpers-dtos";
import client from "@/utils/client";
import { YCC_COMMITTEE_EMAIL_ADDRESS } from "@/utils/constants";
import { mailtoHref } from "@/utils/utils";

import PermissionsDataGrid from "./PermissionsDataGrid";

const PermissionsPage = (): React.ReactNode => {
  const currentUser = useCurrentUser();
  const permissions = usePromise(client.helpers.getPermissions, []);
  const [dataSource, setDataSource] = useState<HelpersAppPermission[]>();
  const [editablePermissions, setEditablePermissions] = useState<
    HelpersAppPermission[]
  >([]);

  if (permissions.result && permissions.result !== dataSource) {
    setDataSource(permissions.result);
    setEditablePermissions(permissions.result);
  }

  const handleClick = (): void => {
    if (!permissions.result) {
      return;
    }

    const to =
      `${YCC_COMMITTEE_EMAIL_ADDRESS},` +
      permissions.result.map((permission) => permission.member.email).join(",");

    const body = `Dear Sailors ⛵️🥳,



Fair Winds,
${currentUser.firstName}`;

    globalThis.location.href = mailtoHref({
      to,
      body,
    });
  };

  return (
    <ReadingBoxLarge>
      <PageTitle value="Permissions" />

      {permissions.result && (
        <>
          <RowStack wrap={true} mb={2}>
            <Typography>
              Currently {editablePermissions.length} members have permissions to
              manage helper tasks.{" "}
            </Typography>
            <Button variant="contained" onClick={handleClick}>
              Send them an email
            </Button>
          </RowStack>
          <PermissionsDataGrid
            permissions={editablePermissions}
            onPermissionsChange={setEditablePermissions}
          />
        </>
      )}

      <PromiseStatus outcomes={[permissions]} />
    </ReadingBoxLarge>
  );
};

export default PermissionsPage;
