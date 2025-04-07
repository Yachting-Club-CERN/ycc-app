import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";

import SmartSpeedDial from "@/components/ui/SmartSpeedDial";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { HelperTask } from "@/model/helpers-dtos";

import { getTaskCloneLocation, getTaskEditLocation } from "../helpers-utils";

type Props = {
  task?: HelperTask;
};

const HelpersSpeedDial: React.FC<Props> = ({ task }) => {
  const currentUser = useCurrentUser();

  if (!currentUser.helpersAppAdminOrEditor) {
    return null;
  }

  const actions = [
    {
      icon: <AddIcon />,
      name: "New Task",
      href: "/helpers/tasks/new",
    },
    ...(task
      ? [
          {
            icon: <EditIcon />,
            name: "Edit Task",
            href: getTaskEditLocation(task.id),
          },
          {
            icon: <ContentCopyIcon />,
            name: "Clone Task",
            href: getTaskCloneLocation(task.id),
          },
        ]
      : []),
  ];

  return <SmartSpeedDial actions={actions} />;
};

export default HelpersSpeedDial;
