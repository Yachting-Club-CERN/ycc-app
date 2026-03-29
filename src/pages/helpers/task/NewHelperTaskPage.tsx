import { useSearchParams } from "react-router-dom";

import ReadingBox from "@/components/layout/ReadingBox";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useHelperTaskCategories from "@/context/shared-data/useHelperTaskCategories";
import useLicenceInfos from "@/context/shared-data/useLicenceInfos";
import useMembers from "@/context/shared-data/useMembers";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";
import { getCurrentYear } from "@/utils/date-utils";

import HelperTaskForm from "./HelperTaskForm";

const NewHelperTaskPage = (): React.ReactNode => {
  const [searchParams] = useSearchParams();
  const taskToCloneId = Number.parseInt(searchParams.get("from") ?? "NaN");

  const taskToClone = usePromise(
    async (signal?: AbortSignal) =>
      Number.isNaN(taskToCloneId)
        ? null
        : await client.helpers.getTaskById(taskToCloneId, signal),
    [taskToCloneId],
  );

  const helperTaskCategories = useHelperTaskCategories();
  const members = useMembers(getCurrentYear());
  const licenceInfos = useLicenceInfos();

  return (
    <ReadingBox>
      <PageTitle value="New Helper Task" />
      {taskToClone.result !== undefined &&
        helperTaskCategories.result &&
        members.result &&
        licenceInfos.result && (
          <HelperTaskForm
            task={taskToClone.result ?? undefined}
            newTask={true}
            categories={helperTaskCategories.result}
            members={members.result}
            licenceInfos={licenceInfos.result}
          />
        )}
      <PromiseStatus
        outcomes={[taskToClone, helperTaskCategories, members, licenceInfos]}
      />
    </ReadingBox>
  );
};

export default NewHelperTaskPage;
