import { NextResponse } from "next/server";
import { legacyActor, legacyRefusal } from "@/app/api/legacy";
import { venueUseCases } from "@/server/composition";
import { requireProxyVerifiedAdmin } from "@/utils/auth";

export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  description?: string;
  areaDescription?: string;
  capacity?: number;
  color?: string;
  bookable?: boolean;
  eventSlug?: string;
};

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

// Admin-only location creation over plain HTTP, for external seeding scripts.
// Auth is decided by the proxy (see requireAdminAuthApi), which forwards a
// header this route re-checks so it fails closed if the proxy didn't run.
//
// Always creates a new location, same as the admin UI action: locations
// aren't unique by name, so a name matching an existing location is not
// treated as a duplicate to reuse. Image upload stays exclusive to the
// admin UI action.
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
    "name",
    "description",
    "areaDescription",
    "color",
    "eventSlug",
  ] as const) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return badRequest(`${field} must be a string`);
    }
  }

  const result = await venueUseCases().createLocation(await legacyActor(req), {
    name: body.name ?? "",
    capacity: body.capacity ?? 0,
    description: body.description,
    areaDescription: body.areaDescription,
    color: body.color,
    bookable: body.bookable ?? false,
    eventSlug: body.eventSlug,
  });
  if (!result.ok) return legacyRefusal(result.error);

  return NextResponse.json({ id: result.value.id }, { status: 201 });
}
