import useSharedData from "./useSharedData";
import usePromise from "../utils/usePromise";

const useMembers = (year: number) => {
  const sharedData = useSharedData();
  return usePromise((signal?: AbortSignal) =>
    sharedData.getMembers(year, signal),
  );
};

export default useMembers;
