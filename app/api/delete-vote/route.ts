import { proposalUseCases } from "@/server/composition";
import { requestNow } from "@/utils/dev-clock";
import { legacyActor, legacyRefusal } from "@/app/api/legacy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { guestId, proposalId } = (await req.json()) as {
    guestId: string;
    proposalId: string;
  };
  const actor = await legacyActor(req);
  let result;
  try {
    result = await proposalUseCases().withdrawVote(
      actor,
      { guestId, proposalId },
      requestNow(req)
    );
  } catch (err) {
    console.error(err);
    return Response.error();
  }
  if (!result.ok) return legacyRefusal(result.error);
  return Response.json({ success: true });
}
