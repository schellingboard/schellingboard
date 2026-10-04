import { sessionUseCases } from "@/server/composition";
import { requestNow } from "@/utils/dev-clock";
import { legacyActor, legacyRefusal } from "@/app/api/legacy";

type RSVPParams = {
  sessionId: string;
  guestId: string;
  remove?: boolean;
};

export const dynamic = "force-dynamic"; // defaults to auto

export async function POST(req: Request) {
  const { sessionId, guestId, remove } = (await req.json()) as RSVPParams;
  const actor = await legacyActor(req);
  const { rsvp, withdrawRsvp } = sessionUseCases();
  let result;
  try {
    result = await (remove ? withdrawRsvp : rsvp)(
      actor,
      { sessionId, guestId },
      requestNow(req)
    );
  } catch (err) {
    console.error(err);
    return Response.error();
  }
  if (!result.ok) return legacyRefusal(result.error);
  return Response.json({ success: true });
}
