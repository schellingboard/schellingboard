import { NextRequest, NextResponse } from "next/server";
import { meetingUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import { requestNow } from "@/utils/dev-clock";

export const dynamic = "force-dynamic";

// Without an explicit no-store, browsers heuristically cache this response and
// go on offering someone who has since been booked.
const NO_STORE = { headers: { "cache-control": "no-store" } };

// Who the caller could ask for a 1-on-1 in one slot. Fetched when the "+" is
// clicked rather than shipped with the schedule: it is per-viewer, and a whole
// event's worth of slots is far more than any one of them needs.
export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("event");
  const slotStart = request.nextUrl.searchParams.get("slot");
  if (!eventId || !slotStart) {
    return NextResponse.json(
      { error: "event and slot parameters are required" },
      { ...NO_STORE, status: 400 }
    );
  }
  const slotCount = Number(request.nextUrl.searchParams.get("slots") ?? "1");
  if (!Number.isInteger(slotCount) || slotCount < 1) {
    return NextResponse.json(
      { error: "slots must be a whole number of at least 1" },
      { ...NO_STORE, status: 400 }
    );
  }

  try {
    const result = await meetingUseCases().listMeetingCandidates(
      await resolveActor(request.cookies),
      { eventId, slotStart, slotCount },
      requestNow(request)
    );
    if (result.ok) return NextResponse.json(result.value, NO_STORE);
    if (result.error.code.startsWith("guest.")) {
      return NextResponse.json(
        { error: "Select your name to arrange a 1-on-1" },
        { ...NO_STORE, status: 403 }
      );
    }
    return NextResponse.json(
      { error: "That slot is not open for 1-on-1s" },
      { ...NO_STORE, status: 404 }
    );
  } catch (error) {
    console.error("Error fetching 1-on-1 candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch the people you could meet" },
      { ...NO_STORE, status: 500 }
    );
  }
}
