import { NextRequest, NextResponse } from "next/server";
import { sessionUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";

export const dynamic = "force-dynamic";

// Without an explicit no-store, browsers heuristically cache this response
// and show stale RSVPs after a reload.
const NO_STORE = { headers: { "cache-control": "no-store" } };

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const user = searchParams.get("user");
  const session = searchParams.get("session");

  if (!user && !session) {
    return NextResponse.json(
      { error: "user or session parameter is required" },
      { ...NO_STORE, status: 400 }
    );
  }

  try {
    const actor = await resolveActor(request.cookies);
    const result = user
      ? await sessionUseCases().listGuestRsvps(actor, { guestId: user })
      : await sessionUseCases().listSessionRsvps(actor, {
          sessionId: session!,
        });
    if (result.ok) return NextResponse.json(result.value, NO_STORE);
    if (result.error.code === "guest.protected") {
      return NextResponse.json(
        { error: "This user's RSVPs are private" },
        { ...NO_STORE, status: 403 }
      );
    }
    return NextResponse.json([], NO_STORE);
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { ...NO_STORE, status: 500 }
    );
  }
}
