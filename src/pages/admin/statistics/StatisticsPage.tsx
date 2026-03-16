import { useMemo } from "react";

import { useYearSelector } from "@/components/input/YearSelector";
import ReadingBoxLarge from "@/components/layout/ReadingBoxLarge";
import SpacedBox from "@/components/layout/SpacedBox";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { useNavigate } from "@/hooks/useNavigate";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";

import ContactStatisticsReport from "./components/ContactStatisticsReport";
import MemberParticipationReport from "./components/MemberParticipationReport";
import MotorboatDriverParticipationReport from "./components/MotorboatDriverParticipationReport";
import OverallStatisticsReport from "./components/OverallStatisticsReport";
import TroubleshootingReport from "./components/TroubleshootingReport";

const StatisticsPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const yearSelector = useYearSelector();

  if (!currentUser.helpersAppAdmin) {
    void navigate("/");
  }

  const allTasks = usePromise(
    (signal) =>
      client.helpers.getTasks(yearSelector.selectedYearForApi, signal),
    [yearSelector.selectedYearForApi],
  );

  const publishedTasks = useMemo(() => {
    if (!allTasks.result) return null;
    return allTasks.result.filter((task) => task.published);
  }, [allTasks.result]);

  return (
    <ReadingBoxLarge>
      <PageTitle value="Statistics" />

      <SpacedBox>{yearSelector.component}</SpacedBox>

      {publishedTasks && <OverallStatisticsReport tasks={publishedTasks} />}

      {publishedTasks && <MemberParticipationReport tasks={publishedTasks} />}

      {publishedTasks && (
        <MotorboatDriverParticipationReport tasks={publishedTasks} />
      )}

      {publishedTasks && <ContactStatisticsReport tasks={publishedTasks} />}

      {publishedTasks && allTasks.result && (
        <TroubleshootingReport
          publishedTasks={publishedTasks}
          allTasks={allTasks.result}
        />
      )}

      <PromiseStatus outcomes={[allTasks]} />
    </ReadingBoxLarge>
  );
};

export default StatisticsPage;
