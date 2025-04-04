import useAuth from "./useAuth";

const useCurrentUser = () => useAuth().currentUser;

export default useCurrentUser;
