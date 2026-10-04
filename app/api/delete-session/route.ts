import type { NextRequest } from "next/server";
import { sessionUseCases } from "@/server/composition";
import { HTTP_STATUS_BY_KIND } from "@/server/kernel/result";
import { resolveActor } from "@/server/kernel/actor";
import { requestNow } from "@/utils/dev-clock";

export const dynamic = "force-dynamic"; // defaults to auto

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as { id: string };
  const actor = await resolveActor(req.cookies);
  let result;
  try {
    result = await sessionUseCases().deleteSession(
      actor,
      { sessionId: id },
      requestNow(req)
    );
  } catch (err) {
    console.error(err);
    return Response.error();
  }
  if (result.ok) return Response.json({ success: true });

  const { kind, code, detail } = result.error;
  if (code === "session.managedByOrganizer")
    return new Response(detail, { status: 400 });
  if (code.startsWith("guest.") || code === "session.notHost") {
    return Response.json(
      { error: "Only a host may delete this session" },
      { status: 403 }
    );
  }
  return new Response(detail, { status: HTTP_STATUS_BY_KIND[kind] });
}
