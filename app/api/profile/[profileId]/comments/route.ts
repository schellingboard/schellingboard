import { NextResponse } from "next/server";
import { commentUseCases } from "@/server/composition";
import { legacyActor } from "@/app/api/legacy";

export const dynamic = "force-dynamic";

// Without an explicit no-store, browsers heuristically cache this response
// and show stale comments after a reload.
const NO_STORE = { headers: { "cache-control": "no-store" } };

// Comments are displayed to everyone in the profile details,
// similarly to sessions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  try {
    const result = await commentUseCases().listComments(
      await legacyActor(request),
      { kind: "profile", id: profileId }
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.detail },
        { ...NO_STORE, status: 404 }
      );
    }
    return NextResponse.json(result.value, NO_STORE);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { ...NO_STORE, status: 500 }
    );
  }
}
