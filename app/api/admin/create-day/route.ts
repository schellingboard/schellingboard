import { NextResponse } from "next/server";
import { legacyActor, legacyDate, legacyRefusal } from "@/app/api/legacy";
import { eventUseCases } from "@/server/composition";
import { requireProxyVerifiedAdmin } from "@/utils/auth";

export const dynamic = "force-dynamic";

// Admin-only day creation over plain HTTP, for external seeding scripts.
// Auth is decided by the proxy (see requireAdminAuthApi), which forwards a
// header this route re-checks so it fails closed if the proxy didn't run.
//
// Behaves the same as createDayAction: a day overlapping an existing one
// (including an exact duplicate) is a 409; otherwise multiple days can be
// created freely, same as in the admin UI.
type Body = {
  eventSlug?: string;
  start?: string;
  end?: string;
  startBookings?: string;
  endBookings?: string;
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

  for (const field of [
    "eventSlug",
    "start",
    "end",
    "startBookings",
    "endBookings",
  ] as const) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return badRequest(`${field} must be a string`);
    }
  }

  if (!body.eventSlug) return badRequest("eventSlug is required");

  const result = await eventUseCases().createDay(await legacyActor(req), {
    eventSlug: body.eventSlug,
    start: legacyDate(body.start),
    end: legacyDate(body.end),
    startBookings: legacyDate(body.startBookings),
    endBookings: legacyDate(body.endBookings),
  });
  if (!result.ok) {
    if (result.error.code === "day.saveFailed") {
      return NextResponse.json({ error: result.error.detail }, { status: 500 });
    }
    return legacyRefusal(result.error);
  }

  return NextResponse.json({ id: result.value.id }, { status: 201 });
}
