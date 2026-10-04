import { getRepositories } from "@/db/container";
import type { Delivery } from "@schellingboard/domain/notification";
import {
  buildEmail,
  UnknownTemplateError,
  type EmailRecipe,
} from "@/emails/registry";
import { sendMail } from "@/utils/mailer";
import { pushToGuest } from "@/utils/push";
import { DELIVERIES, PRUNE_DELIVERIES, type Job } from "./job";

export type EmailPayload = { recipe: EmailRecipe };
export type PushPayload = {
  title: string;
  text: string;
  url: string;
  at: string;
};

const BATCH = 20;
// Longer than a batch could take, so a run that outlives the loop's lease
// still holds its rows against a second process.
const HOLD_MS = 5 * 60 * 1000;
const BACKOFF_MINUTES = [1, 5, 30, 120];
const GIVE_UP_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

async function send(delivery: Delivery): Promise<void> {
  if (delivery.channel === "push") {
    const { at, ...rest } = delivery.payload as PushPayload;
    const notice = { ...rest, at: new Date(at) };
    await pushToGuest(delivery.guestId, notice, notice.at);
    return;
  }
  // The address is read now rather than when queued, so a guest who just
  // corrected it gets the mail at the new one.
  const guest = await getRepositories().guests.findById(delivery.guestId);
  if (!guest) return;
  const { recipe } = delivery.payload as EmailPayload;
  await sendMail({ to: guest.info.email, ...buildEmail(recipe) });
}

function retryAt(delivery: Delivery, now: Date, err: unknown): Date | null {
  if (err instanceof UnknownTemplateError) return null;
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
