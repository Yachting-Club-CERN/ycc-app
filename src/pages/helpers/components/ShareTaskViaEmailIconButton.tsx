import ShareViaEmailIconButton from "@/components/buttons/ShareViaEmailIconButton";
import useCurrentUser from "@/hooks/auth/useCurrentUser";
import { HelperTask } from "@/model/helpers-dtos";

import { createTimingInfoLine } from "../helpers-format";

type Props = {
  task: HelperTask;
};

const ShareTaskViaEmailIconButton = ({ task }: Props) => {
  const currentUser = useCurrentUser();
  const subject = `Helper task: ${task.title}`;

  // Similar to the emails sent by ycc-hull, but uses <br /> over <p> to avoid user confusion in case they edit the email
  const body = `Dear Sailors ⛵️🥳,
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
  Cheers,<br />
  ${currentUser.firstName} ${currentUser.lastName}`;

  return <ShareViaEmailIconButton subject={subject} body={body} />;
};

export default ShareTaskViaEmailIconButton;
