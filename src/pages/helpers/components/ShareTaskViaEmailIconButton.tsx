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
  // The HTML one uses <br /> over <p> to avoid confusion in case the user edits the email

  const plainTextBody = `Dear Sailors ⛵️🥳,

I wanted to share this task with you: ${task.title}

${createTimingInfoLine(task)}

${task.shortDescription}

Open in the App: ${window.location.href}

Fair Winds,
${currentUser.firstName} ${currentUser.lastName}`;

  const htmlBody = `Dear Sailors ⛵️🥳,
<br /><br />
I wanted to share this task with you: ${task.title}
<br /><br />
<strong>${createTimingInfoLine(task)}</strong>
<br /><br />
<em>${task.shortDescription}</em>
<br /><br />
<a
    href="${window.location.href}"
    style="
        display: inline-block;
        padding: 6px 16px;
        font-size: large;
        color: #ffffff;
        background-color: #1976d2;
        text-decoration: none;
        border-radius: 4px;
    "
>
    <strong>Open in the App</strong>
</a>
<br /><br />
Fair Winds,<br />
${currentUser.firstName} ${currentUser.lastName}`;

  return (
    <ShareViaEmailIconButton
      subject={subject}
      plainTextBody={plainTextBody}
      htmlBody={htmlBody}
    />
  );
};

export default ShareTaskViaEmailIconButton;
