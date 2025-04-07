import { User } from "./AuthenticationContext";
import useAuth from "./useAuth";

const useCurrentUser = (): User => useAuth().currentUser;

export default useCurrentUser;
