import type { NextRequest } from "next/server";
import { SESSION_PLACEMENT_CODES } from "@schellingboard/domain/session-booking";
import { sessionUseCases } from "@/server/composition";
import { HTTP_STATUS_BY_KIND } from "@/server/kernel/result";
import { resolveActor } from "@/server/kernel/actor";
import { actingGuestRefusalMessage } from "@/utils/acting-guest";
import { requestNow } from "@/utils/dev-clock";
import { legacyBooking, type SessionParams } from "../session-form-utils";

export const dynamic = "force-dynamic"; // defaults to auto

export async function POST(req: NextRequest) {
  const actor = await resolveActor(req.cookies);
  const params = (await req.json()) as SessionParams;
  let result;
  try {
    result = await sessionUseCases().createSession(
      actor,
      { ...legacyBooking(params), locationId: params.location?.id ?? "" },
      requestNow(req)
    );
  } catch (err) {
    console.error(err);
    return Response.error();
  }
  if (result.ok) return Response.json({ success: true });

  const { kind, code, detail } = result.error;
  if (code.startsWith("guest.")) {
    return Response.json(
      { error: actingGuestRefusalMessage(code, "adding a session") },
      { status: 403 }
    );
  }
  if (SESSION_PLACEMENT_CODES.has(code)) return Response.error();
  return Response.json(
    { error: detail },
    { status: HTTP_STATUS_BY_KIND[kind] }
  );
}
