import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

export function joinLinkEmail(
  props: { name: string; eventName: string; joinUrl: string },
  t: Translate
): EmailMessage {
  const { name, eventName } = props;
  return {
    subject: t(msg`Your link to ${eventName}`),
    body: (
      <>
        <p>{t(msg`Hi ${name},`)}</p>
        <p>
          {t(
            msg`Use this personal link to join ${eventName}. It signs you in as you, so keep it to yourself:`
          )}
        </p>
        <p>
          <a href={props.joinUrl}>{t(msg`Join ${eventName}`)}</a>
        </p>
        <p>
          {t(
            msg`A newer link replaces this one, and so does setting a password: the link then asks you to sign in first.`
          )}
        </p>
      </>
    ),
  };
}

// Sent when an organizer makes a link to hand over themselves, so a scam to
// get someone's link is noticed.
export function joinLinkMadeEmail(
  props: { name: string; eventName: string },
  t: Translate
): EmailMessage {
  const { name, eventName } = props;
  return {
    subject: t(msg`A new link to ${eventName} was made for you`),
    body: (
      <>
        <p>{t(msg`Hi ${name},`)}</p>
        <p>
          {t(
            msg`An organizer made a new personal link for you to join ${eventName}. Links sent to you before no longer work.`
          )}
        </p>
        <p>
          {t(
            msg`If you did not expect this, do not share the link with anyone who asks for it.`
          )}
        </p>
      </>
    ),
  };
}
