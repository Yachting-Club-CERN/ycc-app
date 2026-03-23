import Grid2 from "@mui/material/Grid2";

import { HelperTask } from "@/model/helpers-dtos";

import HelperTaskCard from "./HelperTaskCard";

type Props = {
  tasks: Readonly<HelperTask[]>;
};

const HelperTaskCardGrid = ({ tasks }: Props): React.ReactNode => {
  return (
    <Grid2 container spacing={2} mb={2}>
      {tasks.map((task) => (
        <Grid2 key={task.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <HelperTaskCard task={task} />
        </Grid2>
      ))}
    </Grid2>
  );
};

export default HelperTaskCardGrid;
