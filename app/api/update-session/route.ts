import type { NextRequest } from "next/server";
import { SESSION_PLACEMENT_CODES } from "@schellingboard/domain/session-booking";
import { sessionUseCases } from "@/server/composition";
import { HTTP_STATUS_BY_KIND } from "@/server/kernel/result";
import { resolveActor } from "@/server/kernel/actor";
import { requestNow } from "@/utils/dev-clock";
import { legacyBooking, type SessionParams } from "../session-form-utils";

export const dynamic = "force-dynamic"; // defaults to auto

const TEXT_CODES = new Set(["session.notFound", "event.notSchedulingPhase"]);

export async function POST(req: NextRequest) {
  const params = (await req.json()) as SessionParams;
  if (!params.id) {
    console.error("Session ID is required for update.");
    return new Response("Session ID is required", { status: 400 });
  }
  const actor = await resolveActor(req.cookies);
  let result;
  try {
    result = await sessionUseCases().updateSession(
      actor,
      {
        ...legacyBooking(params),
        sessionId: params.id,
        locationIds: Array.isArray(params.locationIds)
          ? params.locationIds
          : [params.location?.id ?? ""],
        expectedVersion:
          typeof params.expectedVersion === "number"
            ? params.expectedVersion
            : undefined,
      },
      requestNow(req)
    );
  } catch (err) {
    console.error(err);
    return Response.error();
  }
  if (result.ok) return Response.json({ success: true });

  const { kind, code, detail } = result.error;
  if (TEXT_CODES.has(code))
    return new Response(detail, { status: HTTP_STATUS_BY_KIND[kind] });
  if (code === "session.managedByOrganizer")
    return new Response(detail, { status: 400 });
  if (code.startsWith("guest.") || code === "session.notHost") {
    return Response.json(
      { error: "Only a host may edit this session" },
      { status: 403 }
    );
  }
  if (SESSION_PLACEMENT_CODES.has(code)) return Response.error();
  return Response.json(
    { error: detail },
    { status: HTTP_STATUS_BY_KIND[kind] }
  );
}
