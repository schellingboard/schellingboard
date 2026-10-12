import { changes, type ChangeContext } from "@schellingboard/domain/change";
import type { Tx } from "./unit-of-work";

type Shown = Awaited<ReturnType<Tx["guests"]["listShownByEvent"]>>[number];

async function shownIn(tx: Tx, eventId: string, only?: string[]) {
  const shown = await tx.guests.listShownByEvent(eventId, only);
  return new Map(shown.map((g) => [g.id, g]));
}

const same = (a: Shown, b: Shown) =>
  a.name === b.name &&
  a.avatarUrl === b.avatarUrl &&
  a.aboutMe === b.aboutMe &&
  a.authProtected === b.authProtected &&
  a.version === b.version &&
  a.profileVersion === b.profileVersion &&
  a.member === b.member;

/**
 * Runs `work`, which may add guests to events, take them off, edit them, or
 * make them hosts, and records a change for each guest an event shows
 * differently afterwards (ADR 0014 section 9). The event shows members and
 * session hosts. `only` limits the comparison to those guests.
 */
export async function recordingShownGuests<T>(
  tx: Tx,
  eventIds: string[],
  work: () => Promise<T>,
  by: ChangeContext,
  only?: string[]
): Promise<T> {
  const unique = [...new Set(eventIds)];
  const guestIds = only && [...new Set(only)];
  const before = await Promise.all(
    unique.map((id) => shownIn(tx, id, guestIds))
  );
  const result = await work();
  for (const [i, eventId] of unique.entries()) {
    const after = await shownIn(tx, eventId, guestIds);
    for (const [id, guest] of after) {
      const was = before[i].get(id);
      if (!was || !same(was, guest))
        tx.record(changes.guestChanged(guest, guest.member, eventId, by));
    }
    for (const id of before[i].keys())
      if (!after.has(id)) tx.record(changes.guestRemoved(id, eventId, by));
  }
  return result;
}
