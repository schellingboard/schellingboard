import { NextResponse } from "next/server";
import { legacyActor, legacyRefusal } from "@/app/api/legacy";
import { sessionUseCases } from "@/server/composition";
import { requireProxyVerifiedAdmin } from "@/utils/auth";

export const dynamic = "force-dynamic";

// Admin-only RSVP creation over plain HTTP, for external seeding scripts.
// Auth is decided by the proxy (see requireAdminAuthApi), which forwards a
// header this route re-checks so it fails closed if the proxy didn't run.
//
// Unlike /api/toggle-rsvp there is no scheduling-phase gate, so an import
// never depends on the event's current phase. rsvpCapacityHardLimit is still
// enforced, same as toggle-rsvp: a full session is a 409, not a silent
// overbook. The guest is auto-assigned to the session's event so the RSVP is
// never orphaned from the UI's member lists. Idempotent per (session, guest)
// via the repository's onConflictDoNothing.
type Body = { sessionId?: string; guestId?: string };

export async function POST(req: Request) {
  const unverified = requireProxyVerifiedAdmin(req);
  if (unverified) {
    return unverified;
  }

  let body: Body;
  try {
    body = ((await req.json()) ?? {}) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    (body.sessionId !== undefined && typeof body.sessionId !== "string") ||
    (body.guestId !== undefined && typeof body.guestId !== "string")
  ) {
    return NextResponse.json(
      { error: "sessionId and guestId must be strings" },
      { status: 400 }
    );
  }
  const { sessionId, guestId } = body;
  if (!sessionId || !guestId) {
    return NextResponse.json(
      { error: "sessionId and guestId are required" },
      { status: 400 }
    );
  }

  const result = await sessionUseCases().adminAddRsvp(await legacyActor(req), {
    sessionId,
    guestId,
  });
  if (!result.ok) return legacyRefusal(result.error);

  const { rsvp, created } = result.value;
  return NextResponse.json(
    { id: rsvp.id, created },
    { status: created ? 201 : 200 }
  );
}
