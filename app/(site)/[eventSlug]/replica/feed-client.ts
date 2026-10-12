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
  readyState: number;
};

const messageTypes = feedMessageSchema.options.map((o) => o.shape.type.value);

const RETRY_MS = 2000;
const MAX_RETRY_MS = 60_000;
const CLOSED = 2;

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
  let failures = 0;
  let pending = false;

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
        failures = 0;
        if (message) store.applyMessage(message);
      });
    }
    current.addEventListener("open", () => {
      failures = 0;
    });
    current.addEventListener("reset", () => {
      if (current === source && !reloading && !stopped) void reload();
    });
    // The browser reconnects by itself unless the server refused the stream
    // (401, 404), which closes it for good.
    current.addEventListener("error", () => {
      if (current === source && current.readyState === CLOSED) {
        if (!reloading && !stopped) {
          failures++;
          void reload();
        }
      }
    });
  }

  async function reload() {
    reloading = true;
    pending = true;
    source?.close();
    try {
      for (;;) {
        try {
          if (failures > 0) {
            await delay(Math.min(RETRY_MS * 2 ** (failures - 1), MAX_RETRY_MS));
            if (closed || stopped) return;
          }
          const fresh = await loadSnapshot();
          if (closed) return;
          // Unconditional: after a restored backup the snapshot's seq is
          // legitimately lower than the replica's.
          store.replace(fresh);
          if (stopped) return;
          pending = false;
          open();
          onSynced?.();
          return;
        } catch {
          failures++;
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
    // Back from a hidden tab: the server answers a too-old position with a
    // reset, so no snapshot is loaded unless a reload was cut short.
    resume() {
      stopped = false;
      if (closed || reloading) return;
      if (pending) {
        failures = 0;
        void reload();
      } else open();
    },
    restart() {
      stopped = false;
      failures = 0;
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
