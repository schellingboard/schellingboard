import type { ChangeContext } from "@schellingboard/domain/change";
import type { CompleteGuest } from "@schellingboard/domain/guest";

import { recordingShownGuests } from "./shown-guests";
import type { Tx } from "./unit-of-work";

/** Shared by Add user, the proxy sign-in and the sign-up link; an existing email is left as it is. */
export async function makePerson(
  tx: Tx,
  input: {
    name: string;
    email: string | null;
    eventIds: string[];
    nameUnconfirmed?: boolean;
  },
  by: ChangeContext
): Promise<{ guest: CompleteGuest; created: boolean }> {
  const { guest, created } = await tx.guests.findOrCreateByEmail({
    name: input.name,
    info: { email: input.email },
    nameUnconfirmed: input.nameUnconfirmed,
  });
  if (created)
    await recordingShownGuests(
      tx,
      input.eventIds,
      async () => {
        for (const eventId of new Set(input.eventIds))
          await tx.guests.assignToEvent(eventId, [guest.id]);
      },
      by
    );
  return { guest, created };
}
