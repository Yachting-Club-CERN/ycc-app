import Grid from "@mui/material/Grid";

import { HelperTask } from "@/model/helpers-dtos";

import HelperTaskCard from "./HelperTaskCard";

type Props = {
  tasks: readonly HelperTask[];
};

const HelperTaskCardGrid = ({ tasks }: Props): React.ReactNode => {
  return (
    <Grid container spacing={2} mb={2}>
      {tasks.map((task) => (
        <Grid key={task.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <HelperTaskCard task={task} />
        </Grid>
      ))}
    </Grid>
  );
};

export default HelperTaskCardGrid;
