// @module-tag 019-US7
import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createSession } from "../helpers/factories";
import { BY_TEST } from "../helpers/changes";
import { getRepositories } from "@/db/container";
import { unitOfWork, type Tx } from "@/server/kernel/unit-of-work";
import { subscribeToChanges } from "@/server/kernel/change-subscribers";
import { conflict } from "@/server/kernel/result";
import { changes, type RecordedChange } from "@schellingboard/domain/change";

function gate() {
  let open!: () => void;
  const opened = new Promise<void>((resolve) => (open = resolve));
  return { open, opened };
}

describe("unit of work", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  let unsubscribe: (() => void) | undefined;
  afterEach(() => unsubscribe?.());

  async function renamedInside(tx: Tx, id: string, title: string) {
    const before = (await tx.sessions.findById(id))!;
    const after = (await tx.sessions.update(id, { title }))!;
    tx.record(changes.sessionChanged(before, after, BY_TEST));
    return after;
  }

  it("writes neither state nor change when the use case throws", async () => {
    const session = await createSession((await createEvent()).id, {
      title: "Before",
    });
    const published: RecordedChange[] = [];
    unsubscribe = subscribeToChanges((change) => published.push(change));

    await expect(
      unitOfWork.run(async (tx) => {
        await renamedInside(tx, session.id, "After");
        throw new Error("second write failed");
      })
    ).rejects.toThrow("second write failed");

    const { sessions, changes: log } = getRepositories();
    expect((await sessions.findById(session.id))?.title).toBe("Before");
    expect(await log.listAfter(0)).toEqual([]);
    expect(published).toEqual([]);
  });

  it("writes neither state nor change when the use case refuses", async () => {
    const session = await createSession((await createEvent()).id, {
      title: "Before",
    });

    const result = await unitOfWork.run(async (tx) => {
      await renamedInside(tx, session.id, "After");
      return conflict("session.clash", "refused after the first write");
    });

    expect(result.ok).toBe(false);
    const { sessions, changes: log } = getRepositories();
    expect((await sessions.findById(session.id))?.title).toBe("Before");
    expect(await log.listAfter(0)).toEqual([]);
  });

  it("runs concurrent use cases one after the other", async () => {
    const session = await createSession((await createEvent()).id);
    const steps: string[] = [];
    const held = gate();
    const started = gate();

    const first = unitOfWork.run(async (tx) => {
      steps.push("first starts");
      started.open();
      await held.opened;
      await renamedInside(tx, session.id, "First");
      steps.push("first ends");
    });
    await started.opened;
    const second = unitOfWork.run(async (tx) => {
      steps.push("second starts");
      await renamedInside(tx, session.id, "Second");
    });
    held.open();
    await Promise.all([first, second]);

    expect(steps).toEqual(["first starts", "first ends", "second starts"]);
    expect((await getRepositories().sessions.findById(session.id))?.title).toBe(
      "Second"
    );
  });

  it("never shows a read the rows of an open use case", async () => {
    const session = await createSession((await createEvent()).id, {
      title: "Before",
    });
    const held = gate();
    const written = gate();

    const open = unitOfWork.run(async (tx) => {
      await renamedInside(tx, session.id, "Uncommitted");
      written.open();
      await held.opened;
      throw new Error("roll back");
    });
    await written.opened;
    const seen = await unitOfWork.read(async (q) => ({
      session: await q.sessions.findById(session.id),
      changes: await q.changes.listAfter(0),
    }));
    held.open();
    await expect(open).rejects.toThrow();

    expect(seen.session?.title).toBe("Before");
    expect(seen.changes).toEqual([]);
  });

  it("keeps one view for the whole read while writes commit", async () => {
    const session = await createSession((await createEvent()).id, {
      title: "Before",
    });

    const titles = await unitOfWork.read(async (q) => {
      const first = (await q.sessions.findById(session.id))?.title;
      await unitOfWork.run((tx) => renamedInside(tx, session.id, "After"));
      const second = (await q.sessions.findById(session.id))?.title;
      return [first, second];
    });

    expect(titles).toEqual(["Before", "Before"]);
    expect((await getRepositories().sessions.findById(session.id))?.title).toBe(
      "After"
    );
  });

  it("commits and releases the lock when a subscriber throws", async () => {
    const session = await createSession((await createEvent()).id);
    unsubscribe = subscribeToChanges(() => {
      throw new Error("subscriber failed");
    });

    await unitOfWork.run((tx) => renamedInside(tx, session.id, "First"));
    await unitOfWork.run((tx) => renamedInside(tx, session.id, "Second"));

    expect((await getRepositories().sessions.findById(session.id))?.title).toBe(
      "Second"
    );
    expect(await getRepositories().changes.listAfter(0)).toHaveLength(2);
  });

  it("publishes changes after commit, in seq order", async () => {
    const session = await createSession((await createEvent()).id);
    const published: number[] = [];
    const committed: Promise<RecordedChange[]>[] = [];
    unsubscribe = subscribeToChanges((change) => {
      published.push(change.seq);
      // The read runs now, synchronously: it sees the change only if the
      // transaction has committed.
      committed.push(getRepositories().changes.listAfter(change.seq - 1, 1));
    });

    await Promise.all(
      ["One", "Two", "Three"].map((title) =>
        unitOfWork.run(async (tx) => {
          await renamedInside(tx, session.id, title);
          await Promise.resolve();
          await renamedInside(tx, session.id, `${title} again`);
        })
      )
    );

    const log = await getRepositories().changes.listAfter(0);
    expect(published).toEqual(log.map((c) => c.seq));
    expect(published).toHaveLength(6);
    for (const [i, read] of committed.entries()) {
      expect((await read)[0]?.seq).toBe(published[i]);
    }
  });
});
