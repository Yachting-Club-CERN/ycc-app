import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import PageTitle from "@/components/PageTitle";
import AuthenticationContext from "@/context/AuthenticationContext";

import PermissionsDataGrid from "./PermissionsDataGrid";

const PermissionsPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
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
