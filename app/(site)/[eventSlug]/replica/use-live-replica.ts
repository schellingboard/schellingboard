"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  snapshotSchema,
  type Snapshot,
} from "@schellingboard/contracts/snapshot";
import { createLiveReplica } from "./live-replica";

async function fetchSnapshot(slug: string): Promise<Snapshot> {
  const response = await fetch(`/api/v1/events/${slug}/snapshot`);
  if (!response.ok) throw new Error(`snapshot ${response.status}`);
  return snapshotSchema.parse(await response.json());
}

export function useLiveReplica(seed: Snapshot, user: string | null) {
  const [live] = useState(() =>
    createLiveReplica({
      seed,
      user,
      createSource: (url) => new EventSource(url),
      loadSnapshot: fetchSnapshot,
    })
  );
  const { store } = live;
  const replica = useSyncExternalStore(store.subscribe, store.get, store.get);
  const gone = useSyncExternalStore(store.subscribe, store.gone, store.gone);

  useEffect(() => live.adoptSeed(seed), [live, seed]);

  useEffect(() => {
    live.connect(user);
    // Firefox logs a console error for a stream left open as the page
    // unloads; a page restored from the back/forward cache reconnects.
    const hide = () => live.pageHidden();
    const show = (event: PageTransitionEvent) =>
      live.pageShown(event.persisted);
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", show);
    return () => {
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", show);
      live.disconnect();
    };
  }, [live, user]);

  return { replica, gone };
}
