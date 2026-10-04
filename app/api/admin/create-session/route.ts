import { NextResponse } from "next/server";
import { legacyActor, legacyDate, legacyRefusal } from "@/app/api/legacy";
import { sessionUseCases } from "@/server/composition";
import { requireProxyVerifiedAdmin } from "@/utils/auth";

export const dynamic = "force-dynamic";

// Admin-only session creation over plain HTTP, for external seeding scripts.
// Auth is decided by the proxy (see requireAdminAuthApi), which forwards a
// header this route re-checks so it fails closed if the proxy didn't run.
//
// Unlike /api/add-session this returns the created id (which the RSVP step
// needs), takes an explicit end time instead of a duration and the day and
// location objects of the SessionParams shape, and — like the other admin
// seeding routes — has no scheduling-phase or future-time gate: an importer
// routinely seeds past/fixed dates.
//
// Always creates a new session, same as adminCreateSessionAction: sessions
// aren't deduplicated, so a repeated request is a location conflict (409),
// not a silent no-op. Hosts and locations are auto-assigned to the event so
// imported sessions are fully visible without extra calls.
type Body = {
  eventSlug?: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  hostIds?: string[];
  locationIds?: string[];
  capacity?: number;
  adminManaged?: boolean;
  closed?: boolean;
};

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(req: Request) {
  const unverified = requireProxyVerifiedAdmin(req);
  if (unverified) {
    return unverified;
  }

  let body: Body;
  try {
    body = ((await req.json()) ?? {}) as Body;
  } catch {
    return badRequest("Invalid JSON body");
  }

  for (const field of ["eventSlug", "title", "description"] as const) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return badRequest(`${field} must be a string`);
    }
  }
  if (body.hostIds !== undefined && !Array.isArray(body.hostIds)) {
    return badRequest("hostIds must be an array");
  }
  if (body.locationIds !== undefined && !Array.isArray(body.locationIds)) {
    return badRequest("locationIds must be an array");
  }

  if (!body.eventSlug) return badRequest("eventSlug is required");

  const result = await sessionUseCases().adminSeedSession(
    await legacyActor(req),
    {
      eventSlug: body.eventSlug,
      title: body.title ?? "",
      description: body.description ?? "",
      startTime: legacyDate(body.startTime),
      endTime: legacyDate(body.endTime),
      hostIds: body.hostIds ?? [],
      locationIds: body.locationIds ?? [],
      capacity: body.capacity,
      adminManaged: body.adminManaged ?? false,
      closed: body.closed ?? false,
    }
  );
  if (!result.ok) return legacyRefusal(result.error);

  return NextResponse.json({ id: result.value.id }, { status: 201 });
}
