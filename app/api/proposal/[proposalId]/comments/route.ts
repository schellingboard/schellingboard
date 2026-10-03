import { NextResponse } from "next/server";
import { getRepositories } from "@/db/container";

export const dynamic = "force-dynamic";

// Without an explicit no-store, browsers heuristically cache this response
// and show stale comments after a reload.
const NO_STORE = { headers: { "cache-control": "no-store" } };

// Quick Voting moves from proposal to proposal without a server roundtrip, so
// it loads each one's comments from here. They are as public as the proposal.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  const { proposalId } = await params;

  try {
    const { sessionProposals, proposalComments } = getRepositories();
    if (!(await sessionProposals.findById(proposalId))) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { ...NO_STORE, status: 404 }
      );
    }
    return NextResponse.json(await proposalComments.list(proposalId), NO_STORE);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { ...NO_STORE, status: 500 }
    );
  }
}
