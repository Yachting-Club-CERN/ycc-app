import usePromise, { PromiseOutcome } from "@/hooks/usePromise";
import { LicenceDetailedInfo } from "@/model/dtos";

import useSharedData from "./useSharedData";

const useLicenceInfos = (): PromiseOutcome<Readonly<LicenceDetailedInfo[]>> => {
  const sharedData = useSharedData();
  return usePromise(sharedData.getLicenceInfos);
};

export default useLicenceInfos;
