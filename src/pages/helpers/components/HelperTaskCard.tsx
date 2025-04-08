import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { useNavigate } from "@/hooks/useNavigate";
import { HelperTask } from "@/model/helpers-dtos";

import { getTaskLocation } from "../helpers-utils";
import HelperTaskTimingInfo from "./HelperTaskTimingInfo";

type Props = {
  task: HelperTask;
};

const HelperTaskCard: React.FC<Props> = ({ task }) => {
  const navigate = useNavigate();
  const handleClick = async (
    event: React.MouseEvent<HTMLElement>,
  ): Promise<void> => await navigate(getTaskLocation(task.id), event);

  return (
    <Card
      key={task.id}
      className="ycc-helper-task-card"
      sx={{ display: "flex", width: 280 }}
      onClick={handleClick}
      onAuxClick={handleClick}
      onMouseDown={(event) => event.preventDefault()}
    >
      <CardActionArea>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
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
