import usePromise, { PromiseOutcome } from "@/hooks/usePromise";
import { HelperTaskCategory } from "@/model/helpers-dtos";

import useSharedData from "./useSharedData";

const useHelperTaskCategories = (): PromiseOutcome<
  Readonly<HelperTaskCategory[]>
> => {
  const sharedData = useSharedData();
  return usePromise(sharedData.getHelperTaskCategories);
};

export default useHelperTaskCategories;
