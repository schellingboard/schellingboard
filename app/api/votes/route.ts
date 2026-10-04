import { NextRequest, NextResponse } from "next/server";
import { proposalUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";

export const dynamic = "force-dynamic";

// Without an explicit no-store, browsers heuristically cache this response
// and show stale votes after a reload.
const NO_STORE = { headers: { "cache-control": "no-store" } };

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const user = searchParams.get("user");
  const eventSlug = searchParams.get("event");

  if (!user || !eventSlug) {
    return NextResponse.json(
      { error: "User and event parameters are required" },
      { ...NO_STORE, status: 400 }
    );
  }

  try {
    const result = await proposalUseCases().listGuestVotes(
      await resolveActor(request.cookies),
      { guestId: user, event: { slug: eventSlug } }
    );
    if (result.ok) return NextResponse.json(result.value, NO_STORE);
    if (result.error.code === "guest.protected") {
      return NextResponse.json(
        { error: "This user's votes are private" },
        { ...NO_STORE, status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Event not found" },
      { ...NO_STORE, status: 404 }
    );
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { ...NO_STORE, status: 500 }
    );
  }
}
