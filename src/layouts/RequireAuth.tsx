import { Navigate, Outlet } from "react-router-dom";

import useCurrentUser from "@/context/auth/useCurrentUser";

type Props = {
  redirectTo: string;
};

const RequireAdmin = ({ redirectTo }: Props): React.ReactNode => {
  const currentUser = useCurrentUser();

  if (!currentUser.helpersAppAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

const RequireAdminOrEditor = ({ redirectTo }: Props): React.ReactNode => {
  const currentUser = useCurrentUser();

  if (!currentUser.helpersAppAdminOrEditor) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export { RequireAdmin, RequireAdminOrEditor };
