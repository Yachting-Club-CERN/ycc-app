import RowStack from "@/components/layout/RowStack";
import { HelperTasks } from "@/model/helpers-dtos";

import HelperTaskCard from "./HelperTaskCard";

type Props = {
  tasks: HelperTasks;
};

const HelperTaskCardGrid = ({ tasks }: Props) => {
  return (
    <RowStack wrap={true} mb={2}>
      {tasks.map((task) => (
        <HelperTaskCard key={task.id} task={task} />
      ))}
    </RowStack>
  );
};

export default HelperTaskCardGrid;
