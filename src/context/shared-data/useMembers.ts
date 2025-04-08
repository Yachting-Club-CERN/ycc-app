import usePromise, { PromiseOutcome } from "@/hooks/usePromise";
import { MemberPublicInfo } from "@/model/dtos";

import useSharedData from "./useSharedData";

const useMembers = (
  year: number,
): PromiseOutcome<Readonly<MemberPublicInfo[]>> => {
  const sharedData = useSharedData();
  return usePromise(
    async (signal?: AbortSignal) => await sharedData.getMembers(year, signal),
    [year],
  );
};

export default useMembers;
