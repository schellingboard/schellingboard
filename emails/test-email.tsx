import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";

export function testEmail({ name }: { name: string }, t: Translate) {
  return {
    subject: t(msg`Test email`),
    body: (
      <>
        <h1>{t(msg`Test email`)}</h1>
        <p>{t(msg`This is a test email sent to ${name}.`)}</p>
      </>
    ),
  };
}
