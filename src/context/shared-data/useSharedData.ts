import { useContext } from "react";

import SharedDataContext, { sharedData } from "./SharedDataContext";

const useSharedData = (): typeof sharedData => useContext(SharedDataContext);

export default useSharedData;
