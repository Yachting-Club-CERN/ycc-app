import { useContext } from "react";

import AuthenticationContext from "./AuthenticationContext";

const useAuth = () => useContext(AuthenticationContext);

export default useAuth;
