import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { connectFeed } from "./feed-client";
import { createReplicaStore } from "./store";

const viewerOf = (s: Snapshot) => s.me?.guestId ?? null;

type Feed = ReturnType<typeof connectFeed>;
type FeedDeps = Parameters<typeof connectFeed>[0];

/**
 * The replica of an event for one tab: the server-rendered `seed`, kept
 * current by the feed. The feed's viewer is fixed per connection, so a new
 * `user` loads a snapshot for them; seeds that arrive meanwhile are dropped,
 * so that load is the one path that sets up the new user.
 */
export function createLiveReplica({
  seed,
  user,
  createSource,
  loadSnapshot,
  delay,
}: {
  seed: Snapshot;
  user: string | null;
  createSource: FeedDeps["createSource"];
  loadSnapshot: (slug: string) => Promise<Snapshot>;
  delay?: FeedDeps["delay"];
}) {
  const store = createReplicaStore(seed);
  const slug = seed.event.slug;
  let feed: Feed | null = null;
  let feedUser = user;
  let switching = false;

  return {
    store,
    connect(next: string | null) {
      const resume = next === feedUser;
      switching = !resume;
      feed = connectFeed({
        slug,
        store,
        resume,
        onSynced: () => {
          feedUser = next;
          switching = false;
        },
        loadSnapshot: () => loadSnapshot(slug),
        createSource,
        delay,
      });
    },
    disconnect() {
      feed?.close();
      feed = null;
    },
    // A refresh rendered for the previous viewer can land after the switch
    // synced; it must not overwrite the new viewer's private data.
    adoptSeed(next: Snapshot) {
      if (!switching && viewerOf(next) === viewerOf(store.get()))
        store.adopt(next);
    },
    pageHidden: () => feed?.stop(),
    pageShown(persisted: boolean) {
      if (persisted) feed?.restart();
    },
  };
}
