import { VoteChoice } from "@schellingboard/domain/vote";
import { proposalUseCases } from "@/server/composition";
import { requestNow } from "@/utils/dev-clock";
import { legacyActor, legacyRefusal } from "@/app/api/legacy";

type VoteParams = {
  proposalId: string;
  guestId: string;
  choice: VoteChoice;
};

export const dynamic = "force-dynamic"; // defaults to auto

// Replaces any existing vote by that user for that proposal
export async function POST(req: Request) {
  const input = (await req.json()) as VoteParams;
  const actor = await legacyActor(req);
  let result;
  try {
    result = await proposalUseCases().castVote(actor, input, requestNow(req));
  } catch (err) {
    console.error(err);
    return Response.error();
  }
  if (!result.ok) return legacyRefusal(result.error);
  return Response.json({ success: true });
}
