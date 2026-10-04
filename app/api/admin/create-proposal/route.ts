import { NextResponse } from "next/server";
import { legacyActor, legacyRefusal } from "@/app/api/legacy";
import { proposalUseCases } from "@/server/composition";
import { requestNow } from "@/utils/dev-clock";
import { requireProxyVerifiedAdmin } from "@/utils/auth";

export const dynamic = "force-dynamic";

// Admin-only proposal creation over plain HTTP, for external seeding scripts.
// Unlike the site's createProposal server action this has no phase gate: an
// admin seeds proposals regardless of the event phase.
// Auth is decided by the proxy (see requireAdminAuthApi), which forwards a
// header this route re-checks so it fails closed if the proxy didn't run.
type Body = {
  eventSlug?: string;
  title?: string;
  description?: string;
  durationMinutes?: number | null;
  hostIds?: string[];
};

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
    (body.title !== undefined && typeof body.title !== "string") ||
    (body.description !== undefined && typeof body.description !== "string") ||
    (body.hostIds !== undefined && !Array.isArray(body.hostIds))
  ) {
    return NextResponse.json(
      { error: "title and description must be strings, hostIds an array" },
      { status: 400 }
    );
  }
  const result = await proposalUseCases().adminCreateProposal(
    await legacyActor(req),
    {
      event: { slug: body.eventSlug ?? "" },
      title: body.title ?? "",
      description: body.description ?? "",
      durationMinutes: body.durationMinutes ?? null,
      hostIds: body.hostIds ?? [],
    },
    requestNow(req)
  );
  if (!result.ok) {
    // The use case checks the fields before looking the event up, as this
    // route always did.
    if (result.error.code === "event.notFound" && !body.eventSlug) {
      return NextResponse.json(
        { error: "eventSlug is required" },
        { status: 400 }
      );
    }
    return legacyRefusal(result.error);
  }

  return NextResponse.json({ id: result.value.id }, { status: 201 });
}
