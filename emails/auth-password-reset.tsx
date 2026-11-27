import { msg, plural } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

// Sent when a guest asks to set or reset the password on their (protected)
// name, or a site admin sends them such a link. The link works
// once and grants no session: it only lets the recipient choose a new
// password, which they then log in with.
export function authPasswordResetEmail(
  props: {
    name: string;
    resetUrl: string;
    validMinutes: number;
    fromAdmin?: boolean;
  },
  t: Translate
): EmailMessage {
  const { name, validMinutes } = props;
  const hours = validMinutes / 60;
  return {
    subject: t(msg`Set your password`),
    body: (
      <>
        <p>{t(msg`Hi ${name},`)}</p>
        <p>
          {t(
            hours >= 2
              ? msg`Use this link to set a new password for your name. It works once and expires in ${plural(hours, { one: "# hour", other: "# hours" })}:`
              : msg`Use this link to set a new password for your name. It works once and expires in ${plural(validMinutes, { one: "# minute", other: "# minutes" })}:`
          )}
        </p>
        <p>
          <a href={props.resetUrl}>{t(msg`Set your password`)}</a>
        </p>
        <p>
          {t(
            props.fromAdmin
              ? msg`A site admin sent you this link. After you set the password, log in with it.`
              : msg`You’ll then log in with the new password. If you didn’t request this, you can safely ignore this email — nothing changes until the link is used.`
          )}
        </p>
      </>
    ),
  };
}
