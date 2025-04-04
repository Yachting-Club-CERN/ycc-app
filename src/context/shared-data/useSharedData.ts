import { useContext } from "react";

import SharedDataContext from "@/context/shared-data/SharedDataContext";

const useSharedData = () => useContext(SharedDataContext);

export default useSharedData;
