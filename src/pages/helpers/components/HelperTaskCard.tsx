import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import { HelperTask } from "@/model/helpers-dtos";

import { getTaskLocation } from "../helpers-utils";
import HelperTaskTimingInfo from "./HelperTaskTimingInfo";

type Props = {
  task: HelperTask;
};

const HelperTaskCard = ({ task }: Props) => {
  const navigate = useNavigate();
  return (
    <Card
      key={task.id}
      className="ycc-helper-task-card"
      sx={{
        display: "flex",
        width: 280,
      }}
      onClick={async () => {
        await navigate(getTaskLocation(task.id));
      }}
    >
      <CardActionArea>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {task.title}
          </Typography>
          <Typography gutterBottom>
            <HelperTaskTimingInfo task={task} />
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default HelperTaskCard;
