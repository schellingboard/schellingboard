import type { z } from "zod";
import type { pushSubscriptionSchema } from "@schellingboard/contracts/push";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { ok, type Result } from "@/server/kernel/result";
import type { NotificationDeps } from "../ports";

export const subscribeToPush =
  ({ uow }: NotificationDeps) =>
  (
    actor: Actor,
    subscription: z.infer<typeof pushSubscriptionSchema>,
    now: Date
  ): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const acting = await actingGuest(actor, tx.guests);
      if (!acting.ok) return acting;
      await tx.push.saveSubscription({
        guestId: acting.value,
        ...subscription,
        createdAt: now,
      });
      return ok(undefined);
    });

export const unsubscribeFromPush =
  ({ uow }: NotificationDeps) =>
  (actor: Actor, { endpoint }: { endpoint: string }): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const acting = await actingGuest(actor, tx.guests);
      if (!acting.ok) return acting;
      const subscription = await tx.push.findSubscription(endpoint);
      // Scoped to the caller: an endpoint is not a secret worth trusting, and
      // deleting by it alone would let anyone who learns one silence its owner.
      // A device that is already gone, or was never ours, reports success —
      // there is nothing for the browser to do differently either way.
      if (subscription?.guestId === acting.value)
        await tx.push.deleteSubscription(endpoint);
      return ok(undefined);
    });

/**
 * Whether the subscription a browser is holding is the acting guest's. The
 * browser keeps its subscription across name changes and past a server that
 * has dropped the row, so what it holds is not on its own an answer.
 */
export const isPushEnabledHere =
  ({ repos }: NotificationDeps) =>
  async (
    actor: Actor,
    { endpoint }: { endpoint: string }
  ): Promise<Result<boolean>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const subscription = await repos.push.findSubscription(endpoint);
    return ok(subscription?.guestId === acting.value);
  };

// Generated on the first call and never replaced: it is baked into every
// subscription already handed out, and nothing tells a browser to ask again.
export const getPushKey =
  ({ repos, generateVapidKeys }: NotificationDeps) =>
  async (_actor: Actor, now: Date): Promise<Result<{ publicKey: string }>> => {
    const { publicKey } = await repos.push.vapidKeys(generateVapidKeys, now);
    return ok({ publicKey });
  };
