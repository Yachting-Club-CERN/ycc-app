import usePromise, { PromiseOutcome } from "@/hooks/usePromise";
import { MemberPublicInfo } from "@/model/dtos";

import useSharedData from "./useSharedData";

const useMembers = (
  year: number,
): PromiseOutcome<Readonly<MemberPublicInfo[]>> => {
  const sharedData = useSharedData();
  return usePromise((signal?: AbortSignal) =>
    sharedData.getMembers(year, signal),
  );
};

export default useMembers;
