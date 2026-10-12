import {
  feedMessageSchema,
  type FeedMessage,
} from "@schellingboard/contracts/feed";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { ReplicaStore } from "./store";

type Source = {
  addEventListener(
    type: string,
    listener: (event: { data: string }) => void
  ): void;
  close(): void;
};

const messageTypes = feedMessageSchema.options.map((o) => o.shape.type.value);

const RETRY_MS = 2000;

export function connectFeed({
  slug,
  store,
  loadSnapshot,
  createSource,
  resume = true,
  onSynced,
  delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}: {
  slug: string;
  store: ReplicaStore;
  loadSnapshot: () => Promise<Snapshot>;
  createSource: (url: string) => Source;
  resume?: boolean;
  onSynced?: () => void;
  delay?: (ms: number) => Promise<void>;
}) {
  let source: Source | null = null;
  let reloading = false;
  let closed = false;
  let stopped = false;

  function open() {
    source?.close();
    const current = createSource(
      `/api/v1/events/${slug}/feed?since=${store.get().seq}`
    );
    source = current;
    // Only the types this version knows get a listener, so a newer server's
    // unknown type never reaches the store.
    for (const type of messageTypes) {
      current.addEventListener(type, ({ data }) => {
        const message = parse(data);
        if (message) store.applyMessage(message);
      });
    }
    current.addEventListener("reset", () => {
      if (current === source && !reloading && !stopped) void reload();
    });
  }

  async function reload() {
    reloading = true;
    source?.close();
    try {
      for (;;) {
        try {
          const fresh = await loadSnapshot();
          if (closed) return;
          // Unconditional: after a restored backup the snapshot's seq is
          // legitimately lower than the replica's.
          store.replace(fresh);
          if (stopped) return;
          open();
          onSynced?.();
          return;
        } catch {
          await delay(RETRY_MS);
          if (closed || stopped) return;
        }
      }
    } finally {
      reloading = false;
    }
  }

  if (resume) open();
  else void reload();
  return {
    // The page is going into the back/forward cache; restart() brings it back.
    stop() {
      stopped = true;
      source?.close();
    },
    restart() {
      stopped = false;
      if (!closed && !reloading) void reload();
    },
    close() {
      closed = true;
      source?.close();
    },
  };
}

function parse(data: string): FeedMessage | null {
  try {
    const parsed = feedMessageSchema.safeParse(JSON.parse(data));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
