import ShareViaWhatsAppIconButton from "@/components/buttons/ShareViaWhatsAppIconButton";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { HelperTask } from "@/model/helpers-dtos";

import { createTimingInfoLine } from "../helpers-format";

type Props = {
  task: HelperTask;
};

const ShareTaskViaWhatsAppIconButton = ({ task }: Props) => {
  const currentUser = useCurrentUser();
  const message = `Dear Sailors ⛵️🥳,

I wanted to share this task with you: ${task.title}

*${createTimingInfoLine(task)}*

_${task.shortDescription}_

Open in the App: ${window.location.href}

Cheers,
${currentUser.firstName} ${currentUser.lastName}`;

  return <ShareViaWhatsAppIconButton message={message} />;
};

export default ShareTaskViaWhatsAppIconButton;
