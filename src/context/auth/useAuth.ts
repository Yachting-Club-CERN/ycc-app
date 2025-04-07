import { useContext } from "react";

import AuthenticationContext, { auth } from "./AuthenticationContext";

const useAuth = (): typeof auth => useContext(AuthenticationContext);

export default useAuth;
