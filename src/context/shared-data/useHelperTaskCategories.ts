import usePromise from "@/hooks/usePromise";

import useSharedData from "./useSharedData";

const useHelperTaskCategories = () => {
  const sharedData = useSharedData();
  return usePromise(sharedData.getHelperTaskCategories);
};

export default useHelperTaskCategories;
