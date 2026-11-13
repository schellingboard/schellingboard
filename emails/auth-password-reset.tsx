import { msg, plural } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

// Sent when a guest asks to set or reset the password on their (protected)
// name — from "Enable protection" or "Forgot your password?". The link works
// once and grants no session: it only lets the recipient choose a new
// password, which they then log in with.
export function authPasswordResetEmail(
  props: { name: string; resetUrl: string; validMinutes: number },
  t: Translate
): EmailMessage {
  const { name, validMinutes } = props;
  return {
    subject: t(msg`Set your password`),
    body: (
      <>
        <p>{t(msg`Hi ${name},`)}</p>
        <p>
          {t(
            msg`Use this link to set a new password for your name. It works once and expires in ${plural(validMinutes, { one: "# minute", other: "# minutes" })}:`
          )}
        </p>
        <p>
          <a href={props.resetUrl}>{t(msg`Set your password`)}</a>
        </p>
        <p>
          {t(
            msg`You’ll then log in with the new password. If you didn’t request this, you can safely ignore this email — nothing changes until the link is used.`
          )}
        </p>
      </>
    ),
  };
}
