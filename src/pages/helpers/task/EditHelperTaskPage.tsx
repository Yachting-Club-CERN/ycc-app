import { useParams } from "react-router-dom";

import ReadingBox from "@/components/layout/ReadingBox";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useCurrentUser from "@/context/auth/useCurrentUser";
import useHelperTaskCategories from "@/context/shared-data/useHelperTaskCategories";
import useLicenceInfos from "@/context/shared-data/useLicenceInfos";
import useMembers from "@/context/shared-data/useMembers";
import { useNavigate } from "@/hooks/useNavigate";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";
import { getCurrentYear } from "@/utils/date-utils";

import HelperTaskForm from "./HelperTaskForm";

const EditHelperTaskPage: React.FC = () => {
  const { id } = useParams();
  const task = usePromise(
    (signal?: AbortSignal) => {
      const task_id = parseInt(id ?? "NaN");
      if (isNaN(task_id)) {
        throw new Error("Invalid task ID");
      } else {
        return client.helpers.getTaskById(task_id, signal);
      }
    },
    [id],
  );
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  if (!currentUser.helpersAppAdminOrEditor) {
    void navigate("/helpers");
  }

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
