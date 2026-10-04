import { NextResponse } from "next/server";
import { peopleUseCases } from "@/server/composition";
import { requireProxyVerifiedAdmin } from "@/utils/auth";
import { legacyActor, legacyRefusal } from "@/app/api/legacy";

export const dynamic = "force-dynamic";

// Admin-only guest creation over plain HTTP, for external seeding scripts.
// Auth is decided by the proxy (see requireAdminAuthApi), which forwards a
// header this route re-checks so it fails closed if the proxy didn't run.
type Body = { name?: string; email?: string; eventSlug?: string };

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
    (body.name !== undefined && typeof body.name !== "string") ||
    (body.email !== undefined && typeof body.email !== "string")
  ) {
    return NextResponse.json(
      { error: "name and email must be strings" },
      { status: 400 }
    );
  }
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const result = await peopleUseCases().ensureGuest(await legacyActor(req), {
    name,
    email,
    eventSlug: body.eventSlug,
  });
  if (!result.ok) return legacyRefusal(result.error);

  const { id, created } = result.value;
  return NextResponse.json({ id, created }, { status: created ? 201 : 200 });
}
