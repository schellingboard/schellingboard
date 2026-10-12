// @module-tag 007-US8
import { describe, it, expect, vi } from "vitest";
import { createLiveReplica } from "@/app/(site)/[eventSlug]/replica/live-replica";
import { snapshot } from "../helpers/snapshot-fixture";

class FakeSource {
  closed = false;
  listeners = new Map<string, (e: { data: string }) => void>();
  constructor(readonly url: string) {}
  addEventListener(type: string, l: (e: { data: string }) => void) {
    this.listeners.set(type, l);
  }
  close() {
    this.closed = true;
  }
  emit(type: string, data: unknown) {
    this.listeners.get(type)?.({ data: JSON.stringify(data) });
  }
}

const at = (seq: number) => ({ ...snapshot, seq });

function setup(loaded = at(50)) {
  const sources: FakeSource[] = [];
  const loadSnapshot = vi.fn(() => Promise.resolve(loaded));
  const live = createLiveReplica({
    seed: snapshot,
    user: "mia",
    loadSnapshot,
    createSource: (url) => {
      const source = new FakeSource(url);
      sources.push(source);
      return source;
    },
    delay: () => Promise.resolve(),
  });
  return { live, sources, loadSnapshot };
}

describe("live replica", () => {
  it("resumes the feed for the same user and drops a seed older than the replica", () => {
    const { live, sources } = setup();
    live.connect("mia");
    sources[0].emit("event.deleted", {
      seq: snapshot.seq + 5,
      type: "event.deleted",
      commandKey: null,
    });

    live.adoptSeed(at(snapshot.seq + 1));

    expect(live.store.get().seq).toBe(snapshot.seq + 5);
    live.adoptSeed(at(snapshot.seq + 9));
    expect(live.store.get().seq).toBe(snapshot.seq + 9);
    expect(live.store.gone()).toBe(false);
  });

  it("loads one snapshot for a new user and ignores seeds until it lands", async () => {
    const { live, sources, loadSnapshot } = setup();
    live.connect("mia");
    live.disconnect();

    live.connect("sam");
    live.adoptSeed(at(snapshot.seq + 3));
    expect(live.store.get().seq).toBe(snapshot.seq);
    await vi.waitFor(() => expect(sources).toHaveLength(2));

    expect(loadSnapshot).toHaveBeenCalledTimes(1);
    expect(live.store.get().seq).toBe(50);
    expect(sources[1].url).toContain("since=50");
    live.adoptSeed(at(51));
    expect(live.store.get().seq).toBe(51);
  });

  it("closes the stream when the page is hidden and reloads when it is restored", async () => {
    const { live, sources, loadSnapshot } = setup();
    live.connect("mia");

    live.pageHidden();
    expect(sources[0].closed).toBe(true);
    live.pageShown(false);
    expect(loadSnapshot).not.toHaveBeenCalled();
    live.pageShown(true);
    await vi.waitFor(() => expect(sources).toHaveLength(2));

    expect(live.store.get().seq).toBe(50);
  });

  it("shows the event as gone once it is deleted", () => {
    const { live, sources } = setup();
    live.connect("mia");

    sources[0].emit("event.deleted", {
      seq: snapshot.seq + 1,
      type: "event.deleted",
      commandKey: null,
    });

    expect(live.store.gone()).toBe(true);
  });

  it("drops a seed rendered for another viewer than the replica holds", () => {
    const { live } = setup();
    live.connect("mia");
    const other = { ...at(snapshot.seq + 4), me: null };

    live.adoptSeed(other);

    expect(live.store.get().seq).toBe(snapshot.seq);
  });

  it("resumes when the user goes A, B, A before the snapshot for B lands", async () => {
    let finish: (s: ReturnType<typeof at>) => void = () => {};
    const sources: FakeSource[] = [];
    const live = createLiveReplica({
      seed: snapshot,
      user: "mia",
      loadSnapshot: () => new Promise((resolve) => (finish = resolve)),
      createSource: (url) => {
        const source = new FakeSource(url);
        sources.push(source);
        return source;
      },
    });
    live.connect("mia");
    live.disconnect();
    live.connect("sam");
    live.disconnect();
    live.connect("mia");
    finish(at(50));
    await Promise.resolve();
    await Promise.resolve();

    expect(live.store.get().seq).toBe(snapshot.seq);
    expect(sources).toHaveLength(2);
    expect(sources[1].url).toContain(`since=${snapshot.seq}`);
    live.adoptSeed(at(snapshot.seq + 1));
    expect(live.store.get().seq).toBe(snapshot.seq + 1);
  });

  it("opens no stream when the page is hidden while a reload is in flight", async () => {
    let finish: (s: ReturnType<typeof at>) => void = () => {};
    const sources: FakeSource[] = [];
    const live = createLiveReplica({
      seed: snapshot,
      user: "mia",
      loadSnapshot: () => new Promise((resolve) => (finish = resolve)),
      createSource: (url) => {
        const source = new FakeSource(url);
        sources.push(source);
        return source;
      },
    });
    live.connect("mia");
    sources[0].emit("reset", {});

    live.pageHidden();
    finish(at(50));
    await Promise.resolve();
    await Promise.resolve();

    expect(sources).toHaveLength(1);
    expect(sources[0].closed).toBe(true);
  });
});
