import ShareViaEmailIconButton from "@/components/buttons/ShareViaEmailIconButton";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { HelperTask } from "@/model/helpers-dtos";

import { createTimingInfoLine } from "../helpers-format";

type Props = {
  task: HelperTask;
};

const ShareTaskViaEmailIconButton: React.FC<Props> = ({ task }) => {
  const currentUser = useCurrentUser();
  const subject = `Helper task: ${task.title}`;

  // Similar to the emails sent by ycc-hull
  const body = `Dear Sailors ⛵️🥳,

I wanted to share this task with you: ${task.title}

${createTimingInfoLine(task)}

${task.shortDescription}

Open in the App: ${window.location.href}

Fair Winds,
${currentUser.firstName} ${currentUser.lastName}`;

  return <ShareViaEmailIconButton subject={subject} body={body} />;
};

export default ShareTaskViaEmailIconButton;
