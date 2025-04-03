import { useContext } from "react";

import AuthenticationContext from "@/context/AuthenticationContext";

const useAuth = () => useContext(AuthenticationContext);

export default useAuth;
