import { NextResponse } from "next/server";
import { DEFAULT_SLOT_INCREMENT_MINUTES } from "@schellingboard/domain/slots";
import { legacyActor, legacyDate, legacyRefusal } from "@/app/api/legacy";
import { eventUseCases } from "@/server/composition";
import { requireProxyVerifiedAdmin } from "@/utils/auth";

export const dynamic = "force-dynamic";

// Admin-only event creation over plain HTTP, for external seeding scripts.
// Auth is decided by the proxy (see requireAdminAuthApi), which forwards a
// header this route re-checks so it fails closed if the proxy didn't run.
type Body = {
  name?: string;
  description?: string;
  website?: string;
  timezone?: string;
  maxSessionDuration?: number;
  breakMinutes?: number;
  slotIncrementMinutes?: number;
  rsvpCapacityHardLimit?: boolean;
  schedulingPhaseStart?: string;
  schedulingPhaseEnd?: string;
};

// NaN gets the use case's own "positive number" refusal.
const wholeNumber = (value: number) => (Number.isInteger(value) ? value : NaN);

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

  for (const field of ["name", "description", "website", "timezone"] as const) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return badRequest(`${field} must be a string`);
    }
  }

  const result = await eventUseCases().createEvent(await legacyActor(req), {
    name: body.name ?? "",
    description: body.description ?? "",
    website: body.website ?? "",
    timezone: body.timezone ?? "",
    maxSessionDuration: wholeNumber(body.maxSessionDuration ?? 120),
    breakMinutes: wholeNumber(body.breakMinutes ?? 10),
    slotIncrementMinutes:
      body.slotIncrementMinutes ?? DEFAULT_SLOT_INCREMENT_MINUTES,
    rsvpCapacityHardLimit: body.rsvpCapacityHardLimit,
    // Omitting both leaves the event phase-less, so admin seeding and RSVPs
    // work immediately (inSchedPhase treats no phases as always-on).
    phases: {
      schedulingPhaseStart: legacyDate(body.schedulingPhaseStart),
      schedulingPhaseEnd: legacyDate(body.schedulingPhaseEnd),
    },
  });
  if (!result.ok) return legacyRefusal(result.error);

  const { id, slug } = result.value;
  return NextResponse.json({ id, slug }, { status: 201 });
}
