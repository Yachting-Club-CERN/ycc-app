import { useContext } from "react";

import SharedDataContext from "@/context/SharedDataContext";

const useSharedData = () => useContext(SharedDataContext);

export default useSharedData;
