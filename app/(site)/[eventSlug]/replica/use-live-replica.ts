"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  snapshotSchema,
  type Snapshot,
} from "@schellingboard/contracts/snapshot";
import { createLiveReplica } from "./live-replica";
import { staleAt, syncState } from "./sync-state";

async function fetchSnapshot(slug: string): Promise<Snapshot> {
  const response = await fetch(`/api/v1/events/${slug}/snapshot`);
  if (!response.ok) throw new Error(`snapshot ${response.status}`);
  return snapshotSchema.parse(await response.json());
}

export function useLiveReplica(seed: Snapshot, user: string | null) {
  const create = () =>
    createLiveReplica({
      seed,
      user,
      createSource: (url) => new EventSource(url),
      loadSnapshot: fetchSnapshot,
    });
  const [live, setLive] = useState(create);
  // The feed URL names the slug, so a renamed event needs a new replica.
  if (live.slug !== seed.event.slug) setLive(create());
  const { store } = live;
  const replica = useSyncExternalStore(store.subscribe, store.get, store.get);
  const gone = useSyncExternalStore(store.subscribe, store.gone, store.gone);
  const meetingsRevision = useSyncExternalStore(
    store.subscribe,
    store.meetingsRevision,
    store.meetingsRevision
  );

  const link = useSyncExternalStore(store.subscribe, store.link, store.link);
  const [now, setNow] = useState(link.since);
  useEffect(() => {
    if (link.connected) return;
    const timer = setTimeout(
      () => setNow(performance.now()),
      Math.max(0, staleAt(link) - performance.now())
    );
    return () => clearTimeout(timer);
  }, [link]);
  const sync = syncState(link, now);

  useEffect(() => live.adoptSeed(seed), [live, seed]);

  useEffect(() => {
    live.connect(user);
    // Firefox logs a console error for a stream left open as the page
    // unloads; a page restored from the back/forward cache reconnects.
    const hide = () => live.pageHidden();
    const show = (event: PageTransitionEvent) =>
      live.pageShown(event.persisted);
    const visibility = () =>
      live.visibilityChanged(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", visibility);
    // A tab opened in the background gets no visibilitychange.
    if (document.visibilityState === "hidden") visibility();
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", show);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", show);
      live.disconnect();
    };
  }, [live, user]);

  return { replica, gone, meetingsRevision, sync };
}
