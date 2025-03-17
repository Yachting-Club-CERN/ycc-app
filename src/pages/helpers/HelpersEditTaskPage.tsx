import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageTitle from "@/components/PageTitle";
import PromiseStatus from "@/components/PromiseStatus";
import ReadingFriendlyBox from "@/components/ReadingFriendlyBox";
import AuthenticationContext from "@/context/AuthenticationContext";
import SharedDataContext from "@/context/SharedDataContext";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";
import { getCurrentYear } from "@/utils/date-utils";

import HelperTaskForm from "./HelperTaskForm";

const HelpersEditTaskPage = () => {
  const { id } = useParams();
  const getHelperTask = (signal?: AbortSignal) => {
    const task_id = parseInt(id ?? "NaN");
    if (isNaN(task_id)) {
      throw new Error("Invalid task ID");
    } else {
      return client.getHelperTaskById(task_id, signal);
    }
  };
  const task = usePromise(getHelperTask, [id]);
  const currentUser = useContext(AuthenticationContext).currentUser;
  const navigate = useNavigate();
  if (!currentUser.helpersAppAdminOrEditor) {
    void navigate("/helpers");
  }

  const sharedData = useContext(SharedDataContext);
  const helperTaskCategories = usePromise(sharedData.getHelperTaskCategories);
  const members = usePromise((signal?: AbortSignal) =>
    sharedData.getMembers(getCurrentYear(), signal),
  );
  const licenceInfos = usePromise(sharedData.getLicenceInfos);

  return (
    <ReadingFriendlyBox>
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
    </ReadingFriendlyBox>
  );
};

export default HelpersEditTaskPage;
