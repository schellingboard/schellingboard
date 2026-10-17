import { expect } from "vitest";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { reaches } from "@schellingboard/domain/change";
import { apply } from "@/app/legacy/(site)/[eventSlug]/replica/apply";
import { getRepositories } from "@/db/container";
import { project } from "@/server/feed/project";
import { snapshotFor } from "@/server/feed/snapshot";
import type { Actor } from "@/server/kernel/actor";
import { unitOfWork } from "@/server/kernel/unit-of-work";

async function snapshotAs(actor: Actor, slug: string): Promise<Snapshot> {
  const result = await snapshotFor(unitOfWork, actor, slug, new Date());
  if (!result.ok) throw new Error(`No snapshot of ${slug}`);
  return result.value;
}

const byId = (a: { id: string }, b: { id: string }) =>
  a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

// The order of a list is the reader's concern (the selectors sort), and seq
// is the newest of the whole log, not of this viewer's changes; now is the clock.
function comparable(replica: Snapshot) {
  return Object.fromEntries(
    Object.entries(replica)
      .filter(([key]) => key !== "seq" && key !== "now")
      .map(([key, value]) => [
        key,
        Array.isArray(value)
          ? [...(value as { id: string }[])].sort(byId)
          : value,
      ])
  );
}

/**
 * Checks that the changes `work` logs, as the feed would send them to `viewer`,
 * bring the snapshot taken before it to the one taken after (ADR 0014).
 */
export async function expectChangesSuffice(
  viewer: Actor,
  slug: string,
  work: () => Promise<unknown>
): Promise<void> {
  const before = await snapshotAs(viewer, slug);
  await work();
  const after = await snapshotAs(viewer, slug);

  const connection = {
    guestId: before.me?.guestId ?? null,
    admin: viewer.admin,
  };
  const logged = await getRepositories().changes.listAfter(before.seq, 1000);
  const replica = logged
    .filter(
      (c) => c.eventId === before.event.id && reaches(c.audience, connection)
    )
    .flatMap((c) => project(c, connection) ?? [])
    .reduce(apply, before);

  expect(comparable(replica)).toEqual(comparable(after));
}
