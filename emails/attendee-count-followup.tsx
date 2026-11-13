import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

import { formatTime, type TimeProp } from "./format";

// Sent to each host fifteen minutes after their session ends. `recordUrl` is a
// plain deep link carrying no identity or token, like every other notification
// — a host on an unfamiliar browser selects their name first, exactly as with
// any other host-only control.
export function attendeeCountFollowUpEmail(
  props: { title: string; time: TimeProp; recordUrl: string },
  t: Translate
): EmailMessage {
  const { title } = props;
  const time = formatTime(props.time, t);
  return {
    subject: t(msg`How many people came to "${title}"?`),
    body: (
      <>
        <h1>{title}</h1>
        <p>
          {t(
            msg`Your session finished at ${time}. If you counted the room, record the number now — it only takes a moment. Only you and your co-hosts will see it, not the attendees.`
          )}
        </p>
        <p>
          <a href={props.recordUrl}>{t(msg`Record the attendee count`)}</a>
        </p>
        <p>
          {t(
            msg`It’s optional, and you can come back and change it whenever you like.`
          )}
        </p>
      </>
    ),
  };
}
