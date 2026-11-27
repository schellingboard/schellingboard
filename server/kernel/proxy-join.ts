import { getRepositories } from "@/db/container";

import { recordingShownGuests } from "./shown-guests";
import { unitOfWork } from "./unit-of-work";

const joined = new Set<string>();
// A join that began before a switch change must not enter the memo after it.
let generation = 0;

export function forgetProxyJoins() {
  generation++;
  joined.clear();
}

export async function joinProxyEvents(guestId: string) {
  if (joined.has(guestId)) return;
  const started = generation;
  const { events, guests } = getRepositories();
  const joining = (await events.list()).filter((e) => e.proxyJoins);
  if (joining.length > 0) {
    const member = new Set(
      (await guests.listEventsByGuests([guestId]))
        .get(guestId)
        ?.map((e) => e.id)
    );
    const missing = joining.filter((e) => !member.has(e.id)).map((e) => e.id);
    if (missing.length > 0)
      await unitOfWork.run((tx) =>
        recordingShownGuests(
          tx,
          missing,
          async () => {
            for (const eventId of missing)
              await tx.guests.assignToEvent(eventId, [guestId]);
          },
          { actor: { type: "system" }, at: new Date() },
          [guestId]
        )
      );
  }
  if (generation === started) joined.add(guestId);
}
