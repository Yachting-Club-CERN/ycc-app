import { useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageTitle from "@/components/PageTitle";
import PromiseStatus from "@/components/PromiseStatus";
import ReadingFriendlyBox from "@/components/ReadingFriendlyBox";
import AuthenticationContext from "@/context/AuthenticationContext";
import SharedDataContext from "@/context/SharedDataContext";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";
import { getCurrentYear } from "@/utils/date-utils";

import HelperTaskForm from "./HelperTaskForm";

const HelpersNewTaskPage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const navigate = useNavigate();
  if (!currentUser.helpersAppAdminOrEditor) {
    void navigate("/helpers");
  }

  const [searchParams] = useSearchParams();
  const taskToCloneId = parseInt(searchParams.get("from") ?? "NaN");

  const getHelperTask = (signal?: AbortSignal) => {
    if (isNaN(taskToCloneId)) {
      return Promise.resolve(null);
    } else {
      return client.getHelperTaskById(taskToCloneId, signal);
    }
  };
  const taskToClone = usePromise(getHelperTask, [taskToCloneId]);

  const sharedData = useContext(SharedDataContext);
  const helperTaskCategories = usePromise(sharedData.getHelperTaskCategories);
  const members = usePromise((signal?: AbortSignal) =>
    sharedData.getMembers(getCurrentYear(), signal),
  );
  const licenceInfos = usePromise(sharedData.getLicenceInfos);

  return (
    <ReadingFriendlyBox>
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
    </ReadingFriendlyBox>
  );
};

export default HelpersNewTaskPage;
