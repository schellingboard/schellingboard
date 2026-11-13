import type {
  Delivery,
  NoticeMessage,
} from "@schellingboard/domain/notification";

import { getRepositories } from "@/db/container";
import {
  buildEmail,
  type EmailRecipe,
  UnknownTemplateError,
} from "@/emails/registry";
import { renderNotice } from "@/server/kernel/notice";
import { translatorFor } from "@/server/kernel/translator";
import { sendMail } from "@/utils/mailer";
import { pushToGuest } from "@/utils/push";

import { DELIVERIES, type Job, PRUNE_DELIVERIES } from "./job";

export type EmailPayload = { recipe: EmailRecipe };
// `title` and `text` are English, as written when queued; with `recipe` and
// `notice` the push is written in the recipient's language when it is sent.
export type PushPayload = {
  title: string;
  text: string;
  url: string;
  at: string;
  recipe?: EmailRecipe;
  notice?: NoticeMessage;
};

// Small: the loop runs nothing else, reminders included, while a batch sends,
// and a batch that hits the SMTP timeouts on every message must end within
// HOLD_MS.
const BATCH = 5;
// Longer than a batch could take, so a run that outlives the loop's lease
// still holds its rows against a second process.
const HOLD_MS = 5 * 60 * 1000;
const BACKOFF_MINUTES = [1, 5, 30, 120];
const GIVE_UP_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

async function send(delivery: Delivery): Promise<void> {
  if (delivery.channel === "push") {
    const {
      at,
      recipe,
      notice: message,
      ...rest
    } = delivery.payload as PushPayload;
    const guest = await getRepositories().guests.findById(delivery.guestId);
    const t = translatorFor(guest?.info.locale);
    // A push that cannot be written in the recipient's language still goes
    // out in the text it was queued with.
    const written = (render: () => string, stored: string) => {
      try {
        return render();
      } catch (err) {
        console.error(
          "Could not write a push in the recipient's language:",
          err
        );
        return stored;
      }
    };
    const notice = {
      ...rest,
      title: recipe
        ? written(() => buildEmail(recipe, t).subject, rest.title)
        : rest.title,
      text: message
        ? written(() => renderNotice(message, t), rest.text)
        : rest.text,
      at: new Date(at),
    };
    await pushToGuest(delivery.guestId, notice, notice.at);
    return;
  }
  // The address is read now rather than when queued, so a guest who just
  // corrected it gets the mail at the new one.
  const guest = await getRepositories().guests.findById(delivery.guestId);
  if (!guest?.info.email) return;
  const { recipe } = delivery.payload as EmailPayload;
  await sendMail({
    to: guest.info.email,
    ...buildEmail(recipe, translatorFor(guest.info.locale)),
  });
}

// A 5xx to the recipient or the message will be the same tomorrow. One to the
// login or the sender is the instance's configuration, which can be fixed.
function refusedForGood(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const { responseCode, command } = err as {
    responseCode?: number;
    command?: string;
  };
  return (
    responseCode !== undefined &&
    responseCode >= 500 &&
    (command === "RCPT TO" || command === "DATA")
  );
}

function retryAt(delivery: Delivery, now: Date, err: unknown): Date | null {
  if (err instanceof UnknownTemplateError || refusedForGood(err)) return null;
  const failingSince = delivery.firstFailedAt ?? now;
  if (now.getTime() - failingSince.getTime() >= GIVE_UP_MS) return null;
  const step = Math.min(delivery.attempts, BACKOFF_MINUTES.length - 1);
  return new Date(now.getTime() + BACKOFF_MINUTES[step] * 60 * 1000);
}

/** Sends the emails and pushes notification code has queued (ADR 0011). */
export const deliveries: Job = {
  name: DELIVERIES,
  run: async (now) => {
    const { deliveries: queue } = getRepositories();
    const due = await queue.claimDue(now, BATCH, HOLD_MS);
    for (const delivery of due) {
      try {
        await send(delivery);
        await queue.markSent(delivery.id, now);
      } catch (err) {
        const retry = retryAt(delivery, now, err);
        await queue.markFailed(delivery.id, now, String(err), retry);
        console.error(
          `Delivery ${delivery.id} (${delivery.channel}) failed${retry ? "" : ", giving up"}:`,
          err
        );
      }
    }
    return due.length;
  },
};

export const pruneDeliveries: Job = {
  name: PRUNE_DELIVERIES,
  run: async (now) => {
    const { deliveries: queue } = getRepositories();
    await queue.pruneSettled(new Date(now.getTime() - RETENTION_MS));
    return 0;
  },
};
