import { msg, plural } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

// Sent when a guest requests a temporary login code to switch to their
// (protected) name. The code is shown big enough to copy onto another device;
// the link logs in directly on the device the email is opened on. It works
// once and only logs in — it can never change the account's password.
export function authCodeEmail(
  props: {
    name: string;
    code: string;
    loginUrl: string;
    validMinutes: number;
  },
  t: Translate
): EmailMessage {
  const { name, validMinutes } = props;
  return {
    subject: t(msg`Your temporary login code`),
    body: (
      <>
        <p>{t(msg`Hi ${name},`)}</p>
        <p>{t(msg`Your temporary login code is:`)}</p>
        <p style={{ fontSize: "28px", letterSpacing: "4px" }}>
          <strong>{props.code}</strong>
        </p>
        <p>
          {t(
            msg`It works once, for ${plural(validMinutes, { one: "# minute", other: "# minutes" })} — type it on the device where you are logging in, or log in here directly:`
          )}
        </p>
        <p>
          <a href={props.loginUrl}>{t(msg`Log in as ${name}`)}</a>
        </p>
        <p>
          {t(
            msg`If you didn’t request this code, you can safely ignore this email.`
          )}
        </p>
      </>
    ),
  };
}
