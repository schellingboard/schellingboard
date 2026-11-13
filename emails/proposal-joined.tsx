import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

export function proposalJoinedEmail(
  props: { title: string; joinerName: string; proposalUrl: string },
  t: Translate
): EmailMessage {
  const { title, joinerName } = props;
  return {
    subject: t(msg`${joinerName} joined your proposal: ${title}`),
    body: (
      <>
        <h1>{title}</h1>
        <p>
          {t(
            msg`${joinerName} joined this proposal as a co-host and can now edit it with you. It is no longer marked as looking for a co-host.`
          )}
        </p>
        <p>
          <a href={props.proposalUrl}>{t(msg`View the proposal`)}</a>
        </p>
      </>
    ),
  };
}
