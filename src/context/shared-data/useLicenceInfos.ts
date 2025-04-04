import usePromise from "@/hooks/usePromise";

import useSharedData from "./useSharedData";

const useLicenceInfos = () => {
  const sharedData = useSharedData();
  return usePromise(sharedData.getLicenceInfos);
};

export default useLicenceInfos;
