import type { NextRequest } from "next/server";
import { SESSION_PLACEMENT_CODES } from "@schellingboard/domain/session-booking";
import { idempotentAction, sessionUseCases } from "@/server/composition";
import { HTTP_STATUS_BY_KIND } from "@/server/kernel/result";
import { resolveActor } from "@/server/kernel/actor";
import { actingGuestRefusalMessage } from "@/utils/acting-guest";
import { requestNow } from "@/utils/dev-clock";
import { legacyBooking, type SessionParams } from "../session-form-utils";

export const dynamic = "force-dynamic"; // defaults to auto

type Outcome =
  | { success: true }
  | { error: string; status: number }
  | { error: ""; networkError: true };

export async function POST(req: NextRequest) {
  const actor = await resolveActor(req.cookies);
  const params = (await req.json()) as SessionParams;
  const now = requestNow(req);
  const outcome = await idempotentAction(
    {
      actor,
      key: req.headers.get("idempotency-key") ?? undefined,
      name: "addSession",
      input: params,
      now,
    },
    async (): Promise<Outcome> => {
      const result = await sessionUseCases().createSession(
        actor,
        { ...legacyBooking(params), locationId: params.location?.id ?? "" },
        now
      );
      if (result.ok) return { success: true };
      const { kind, code, detail } = result.error;
      if (code.startsWith("guest.")) {
        return {
          error: actingGuestRefusalMessage(code, "adding a session"),
          status: 403,
        };
      }
      if (SESSION_PLACEMENT_CODES.has(code))
        return { error: "", networkError: true };
      return { error: detail ?? "", status: HTTP_STATUS_BY_KIND[kind] };
    }
  ).catch((err: unknown) => {
    console.error(err);
    return { error: "", networkError: true } as const;
  });
  if ("success" in outcome) return Response.json({ success: true });
  if ("networkError" in outcome) return Response.error();
  if ("status" in outcome) {
    return Response.json({ error: outcome.error }, { status: outcome.status });
  }
  // The key was reused or is still in flight.
  return Response.json({ error: outcome.error }, { status: 409 });
}
