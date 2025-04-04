import usePromise from "@/hooks/usePromise";

import useSharedData from "./useSharedData";

const useMembers = (year: number) => {
  const sharedData = useSharedData();
  return usePromise((signal?: AbortSignal) =>
    sharedData.getMembers(year, signal),
  );
};

export default useMembers;
