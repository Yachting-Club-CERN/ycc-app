import { useParams } from "react-router-dom";

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

const EditHelperTaskPage: React.FC = () => {
  const { id } = useParams();
  const task = usePromise(
    async (signal?: AbortSignal) => {
      const task_id = Number.parseInt(id ?? "NaN");
      if (Number.isNaN(task_id)) {
        throw new TypeError("Invalid task ID");
      } else {
        return await client.helpers.getTaskById(task_id, signal);
      }
    },
    [id],
  );

  const helperTaskCategories = useHelperTaskCategories();
  const members = useMembers(getCurrentYear());
  const licenceInfos = useLicenceInfos();

  return (
    <ReadingBox>
      <PageTitle value="Edit Helper Task" />
      {task.result &&
        helperTaskCategories.result &&
        members.result &&
        licenceInfos.result && (
          <HelperTaskForm
            task={task.result}
            newTask={false}
            categories={helperTaskCategories.result}
            members={members.result}
            licenceInfos={licenceInfos.result}
          />
        )}
      <PromiseStatus
        outcomes={[task, helperTaskCategories, members, licenceInfos]}
      />
    </ReadingBox>
  );
};

export default EditHelperTaskPage;
