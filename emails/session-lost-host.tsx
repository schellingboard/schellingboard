import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

// Sent to the RSVP'd guests when a session is left without a host.
export function sessionLostHostEmail(
  props: { title: string; sessionUrl: string },
  t: Translate
): EmailMessage {
  const { title } = props;
  return {
    subject: t(msg`No host for: ${title}`),
    body: (
      <>
        <h1>{title}</h1>
        <p>{t(msg`A session you RSVP’d to has no host now.`)}</p>
        <p>
          {t(
            msg`It may be cancelled. You can become its host on the session page.`
          )}
        </p>
        <p>
          <a href={props.sessionUrl}>{t(msg`View the session`)}</a>
        </p>
      </>
    ),
  };
}
