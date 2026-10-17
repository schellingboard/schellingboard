import { idempotentAction, sessionUseCases } from "@/server/composition";
import type { AppError } from "@/server/kernel/result";
import { requestNow } from "@/utils/dev-clock";
import { legacyActor, legacyRefusal } from "@/app/api/legacy";

type RSVPParams = {
  sessionId: string;
  guestId: string;
  remove?: boolean;
};

type Outcome = { success: true } | { error: AppError };

export const dynamic = "force-dynamic"; // defaults to auto

export async function POST(req: Request) {
  const { sessionId, guestId, remove } = (await req.json()) as RSVPParams;
  const actor = await legacyActor(req);
  const { rsvp, withdrawRsvp } = sessionUseCases();
  const now = requestNow(req);
  let outcome;
  try {
    outcome = await idempotentAction(
      {
        actor,
        key: req.headers.get("idempotency-key") ?? undefined,
        name: "toggleRsvp",
        input: { sessionId, guestId, remove: !!remove },
        now,
      },
      async (): Promise<Outcome> => {
        const result = await (remove ? withdrawRsvp : rsvp)(
          actor,
          { sessionId, guestId },
          now
        );
        return result.ok ? { success: true } : { error: result.error };
      }
    );
  } catch (err) {
    console.error(err);
    return Response.error();
  }
  if ("success" in outcome) return Response.json({ success: true });
  if ("idempotency" in outcome) {
    return Response.json({ error: outcome.error }, { status: 409 });
  }
  return legacyRefusal(outcome.error);
}
