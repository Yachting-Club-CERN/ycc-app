import { useNavigate } from "react-router-dom";

import PageTitle from "@/components/ui/PageTitle";
import useCurrentUser from "@/context/auth/useCurrentUser";

import PermissionsDataGrid from "./PermissionsDataGrid";

const PermissionsPage = () => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  if (!currentUser.helpersAppAdmin) {
    void navigate("/");
  }

  return (
    <>
      <PageTitle value="Permissions" />

      <PermissionsDataGrid />
    </>
  );
};

export default PermissionsPage;
