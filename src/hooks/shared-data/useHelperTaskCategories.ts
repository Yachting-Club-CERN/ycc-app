import useSharedData from "./useSharedData";
import usePromise from "../utils/usePromise";

const useHelperTaskCategories = () => {
  const sharedData = useSharedData();
  return usePromise(sharedData.getHelperTaskCategories);
};

export default useHelperTaskCategories;
