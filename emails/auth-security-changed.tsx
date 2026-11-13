import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

// Sent when a protected guest's password changes or protection is turned
// off — a heads-up in case the guest didn't make the change themselves.
// Never sent for a guest's first-ever password (nothing to notify about),
// and never blocks the change it follows if sending fails.
export function authSecurityChangedEmail(
  props: { name: string; change: "disabled" | "password-changed" },
  t: Translate
): EmailMessage {
  const { name } = props;
  const disabled = props.change === "disabled";
  return {
    subject: disabled
      ? t(msg`Your name protection was turned off`)
      : t(msg`Your password was changed`),
    body: (
      <>
        <p>{t(msg`Hi ${name},`)}</p>
        <p>
          {disabled
            ? t(
                msg`Protection on your name was just turned off — anyone can now act under it until you protect it again.`
              )
            : t(msg`Your password was just changed.`)}
        </p>
        <p>
          {t(
            msg`If you didn’t make this change, protect your name again (or set a new password) from Settings — an emailed code gets you back in even without the old password.`
          )}
        </p>
      </>
    ),
  };
}
