import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { connectFeed } from "./feed-client";
import { autosaveReplica, openReplica } from "./open-replica";
import type { ReplicaPersistence } from "./persistence";

// A hidden tab drops its stream so it holds no server connection; a short
// switch away keeps it.
const HIDDEN_CLOSE_MS = 30_000;

type FeedDeps = Parameters<typeof connectFeed>[0];

/**
 * One event's replica for one viewer, kept current: opened from the device or
 * the network, followed on the feed, saved to the device, and paused while the
 * tab is hidden or in the back/forward cache. The feed belongs to one viewer,
 * so a different viewer is a new session.
 */
export async function startReplicaSession({
  slug,
  viewer,
  persistence,
  loadSnapshot,
  createSource,
  delay,
  doc = document,
  win = window,
}: {
  slug: string;
  viewer: string | null;
  persistence: Pick<ReplicaPersistence, "load" | "discardOthers" | "save">;
  loadSnapshot: () => Promise<Snapshot>;
  createSource: FeedDeps["createSource"];
  delay?: FeedDeps["delay"];
  doc?: Pick<Document, "addEventListener" | "removeEventListener"> & {
    visibilityState: string;
  };
  win?: Pick<Window, "addEventListener" | "removeEventListener">;
}) {
  const { store, persisted } = await openReplica({
    slug,
    viewer,
    persistence,
    loadSnapshot,
  });
  const feed = connectFeed({ slug, store, loadSnapshot, createSource, delay });
  const stopSaving = autosaveReplica(store, persistence, {
    fresh: !persisted,
  });

  let hiddenTimer: ReturnType<typeof setTimeout> | undefined;
  let hiddenStop = false;
  const visibility = () => {
    clearTimeout(hiddenTimer);
    if (doc.visibilityState === "hidden") {
      hiddenTimer = setTimeout(() => {
        hiddenStop = true;
        feed.stop();
      }, HIDDEN_CLOSE_MS);
    } else if (hiddenStop) {
      hiddenStop = false;
      feed.resume();
    }
  };
  // Firefox logs a console error for a stream left open as the page unloads;
  // a page restored from the back/forward cache reconnects.
  const hide = () => feed.stop();
  const show = (event: Event) => {
    if ((event as PageTransitionEvent).persisted) feed.restart();
  };
  doc.addEventListener("visibilitychange", visibility);
  win.addEventListener("pagehide", hide);
  win.addEventListener("pageshow", show);
  // A tab opened in the background gets no visibilitychange.
  if (doc.visibilityState === "hidden") visibility();

  return {
    store,
    persisted,
    stop() {
      clearTimeout(hiddenTimer);
      doc.removeEventListener("visibilitychange", visibility);
      win.removeEventListener("pagehide", hide);
      win.removeEventListener("pageshow", show);
      stopSaving();
      feed.close();
    },
  };
}
