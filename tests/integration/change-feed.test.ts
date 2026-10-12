// @module-tag 007-US8
import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { BY_TEST, updateLoggedSession } from "../helpers/changes";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { changes, type Viewer } from "@schellingboard/domain/change";
import type { FeedMessage } from "@schellingboard/contracts/feed";
import { openFeed } from "@/server/feed/feed";
import { unitOfWork, type UnitOfWork } from "@/server/kernel/unit-of-work";
import { CHANGE_NOTIFICATIONS } from "@/utils/jobs/job";
import { pruneChanges } from "@/utils/jobs/reactions";

const EVERYONE: Viewer = { guestId: null, admin: false };
const DAY_MS = 24 * 60 * 60 * 1000;

describe("the change feed", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  let close: (() => void) | undefined;
  afterEach(() => close?.());

  async function listen(
    eventId: string,
    since: number,
    viewer: Viewer = EVERYONE
  ): Promise<FeedMessage[]> {
    const sent: FeedMessage[] = [];
    const feed = await openFeed(
      unitOfWork,
      { eventId, viewer, since },
      (m) => void sent.push(m)
    );
    if (feed.kind === "open") close = feed.close;
    else throw new Error("the feed was reset");
    return sent;
  }

  async function renamed(sessionId: string, titles: string[]) {
    for (const title of titles) await updateLoggedSession(sessionId, { title });
  }

  it("replays what the event logged after the resume point, then goes live", async () => {
    const event = await createEvent();
    const session = await createSession(event.id);
    await renamed(session.id, ["One", "Two"]);
    const [first] = await getRepositories().changes.listAfter(0);

    const sent = await listen(event.id, first.seq);
    expect(sent.map((m) => m.type)).toEqual(["session.changed"]);

    await renamed(session.id, ["Three"]);
    expect(sent.map((m) => m.seq)).toEqual([first.seq + 1, first.seq + 2]);
  });

  it("sends nothing from another event", async () => {
    const event = await createEvent();
    const other = await createEvent();
    const mine = await createSession(event.id);
    const theirs = await createSession(other.id);
    const sent = await listen(event.id, 0);

    await renamed(theirs.id, ["Elsewhere"]);
    await renamed(mine.id, ["Here"]);

    expect(sent).toHaveLength(1);
  });

  it("sends a guest's RSVP to that guest only", async () => {
    const event = await createEvent();
    const session = await createSession(event.id);
    const guest = await createGuest();
    const other = await createGuest();
    const forGuest = await listen(event.id, 0, {
      guestId: guest.id,
      admin: false,
    });
    const forOther = await listen(event.id, 0, {
      guestId: other.id,
      admin: false,
    });
    const forAdmin = await listen(event.id, 0, { guestId: null, admin: true });

    await unitOfWork.run(async (tx) => {
      const rsvp = await tx.rsvps.create({
        sessionId: session.id,
        guestId: guest.id,
      });
      tx.record(changes.rsvpAdded(rsvp, event.id, BY_TEST));
    });

    expect(forGuest.map((m) => m.type)).toEqual(["rsvp.added"]);
    expect(forOther).toEqual([]);
    expect(forAdmin).toEqual([]);
  });

  it("does not replay a private change to someone else on resume", async () => {
    const event = await createEvent();
    const session = await createSession(event.id);
    const guest = await createGuest();
    await unitOfWork.run(async (tx) => {
      const rsvp = await tx.rsvps.create({
        sessionId: session.id,
        guestId: guest.id,
      });
      tx.record(changes.rsvpAdded(rsvp, event.id, BY_TEST));
    });

    expect(await listen(event.id, 0)).toEqual([]);
  });

  it("stops sending once closed", async () => {
    const event = await createEvent();
    const session = await createSession(event.id);
    const sent = await listen(event.id, 0);
    close?.();

    await renamed(session.id, ["Late"]);

    expect(sent).toEqual([]);
  });

  it("sends each change once, in order, however writes overlap the replay", async () => {
    const event = await createEvent();
    const session = await createSession(event.id);
    await renamed(session.id, ["a", "b", "c"]);
    const sent: FeedMessage[] = [];
    const writes = Promise.all(
      Array.from({ length: 15 }, (_, i) =>
        updateLoggedSession(session.id, { title: `w${i}` })
      )
    );

    const feed = await openFeed(
      unitOfWork,
      { eventId: event.id, viewer: EVERYONE, since: 0 },
      (m) => void sent.push(m)
    );
    await writes;
    if (feed.kind === "open") close = feed.close;

    const logged = (await getRepositories().changes.listAfter(0)).map(
      (c) => c.seq
    );
    expect(sent.map((m) => m.seq)).toEqual(logged);
  });

  describe("a resume point it cannot serve", () => {
    it("resets when it lies above the newest change", async () => {
      const event = await createEvent();
      const session = await createSession(event.id);
      await renamed(session.id, ["One"]);

      const feed = await openFeed(
        unitOfWork,
        { eventId: event.id, viewer: EVERYONE, since: 99 },
        () => {}
      );

      expect(feed.kind).toBe("reset");
    });

    it("resets when pruning passes it while the replay runs", async () => {
      const event = await createEvent();
      const session = await createSession(event.id);
      await renamed(session.id, ["One", "Two"]);
      const { changes: log, jobs } = getRepositories();
      const [, second] = await log.listAfter(0);
      await jobs.setCursor(CHANGE_NOTIFICATIONS, second.seq);
      let reads = 0;
      const pruning: UnitOfWork = {
        ...unitOfWork,
        read: async (work) => {
          const result = await unitOfWork.read(work);
          if (++reads === 2) {
            await pruneChanges.run(new Date(Date.now() + 30 * DAY_MS));
          }
          return result;
        },
      };

      const feed = await openFeed(
        pruning,
        { eventId: event.id, viewer: EVERYONE, since: 0 },
        () => {}
      );

      expect(feed.kind).toBe("reset");
    });

    it("resets when it lies below what pruning removed, not when it is at it", async () => {
      const event = await createEvent();
      const session = await createSession(event.id);
      await renamed(session.id, ["One", "Two"]);
      const { changes: log, jobs } = getRepositories();
      const [first, second] = await log.listAfter(0);
      await jobs.setCursor(CHANGE_NOTIFICATIONS, second.seq);
      await pruneChanges.run(new Date(Date.now() + 30 * DAY_MS));
      expect(await log.listAfter(0)).toEqual([]);

      const below = await openFeed(
        unitOfWork,
        { eventId: event.id, viewer: EVERYONE, since: first.seq - 1 },
        () => {}
      );
      const at = await openFeed(
        unitOfWork,
        { eventId: event.id, viewer: EVERYONE, since: second.seq },
        () => {}
      );

      expect(below.kind).toBe("reset");
      expect(at.kind).toBe("open");
      if (at.kind === "open") at.close();
    });
  });
});

describe("pruning the change log", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  it("removes only a contiguous prefix, so a resume point is either served or reset", async () => {
    const event = await createEvent();
    const session = await createSession(event.id);
    const t0 = new Date("2026-06-01T00:00:00.000Z");
    const at = (days: number) => ({
      ...BY_TEST,
      at: new Date(t0.getTime() + days * DAY_MS),
    });
    for (const days of [0, 7.5, 0]) {
      await updateLoggedSession(session.id, { title: `d${days}` }, at(days));
    }
    const { changes: log, jobs } = getRepositories();
    const [first, second, third] = await log.listAfter(0);
    await jobs.setCursor(CHANGE_NOTIFICATIONS, third.seq);

    await pruneChanges.run(new Date(t0.getTime() + 8 * DAY_MS));

    expect((await log.listAfter(0)).map((c) => c.seq)).toEqual([
      second.seq,
      third.seq,
    ]);
    expect(await log.getPrunedThrough()).toBe(first.seq);
  });
});
