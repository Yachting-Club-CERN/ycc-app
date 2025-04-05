import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import SpacedTypography from "@/components/ui/SpacedTypography";
import { getCurrentYear } from "@/utils/date-utils";

import HelperTaskCardGrid from "../helpers/components/HelperTaskCardGrid";
import { useFilteredHelperTasks } from "../helpers/useFilteredHelperTasks";

const MyTasksView = () => {
  const tasks = useFilteredHelperTasks({
    year: getCurrentYear(),
    showOnlyContactOrSignedUp: true,
  });

  return (
    <>
      <PageTitle value="My Tasks" />

      {tasks.result && tasks.result.length > 0 && (
        <HelperTaskCardGrid tasks={tasks.result} />
      )}
      {tasks.result && tasks.result.length === 0 && (
        <SpacedTypography>You have no tasks yet. 😢</SpacedTypography>
      )}

      <PromiseStatus outcomes={[tasks]} />
    </>
  );
};

export default MyTasksView;
