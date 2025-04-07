import RowStack from "@/components/layout/RowStack";
import { HelperTask } from "@/model/helpers-dtos";

import HelperTaskCard from "./HelperTaskCard";

type Props = {
  tasks: Readonly<HelperTask[]>;
};

const HelperTaskCardGrid: React.FC<Props> = ({ tasks }) => {
  return (
    <RowStack wrap={true} mb={2}>
      {tasks.map((task) => (
        <HelperTaskCard key={task.id} task={task} />
      ))}
    </RowStack>
  );
};

export default HelperTaskCardGrid;
