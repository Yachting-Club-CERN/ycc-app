import useSharedData from "./useSharedData";
import usePromise from "../utils/usePromise";

const useLicenceInfos = () => {
  const sharedData = useSharedData();
  return usePromise(sharedData.getLicenceInfos);
};

export default useLicenceInfos;
