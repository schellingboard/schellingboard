// @module-tag 007-US8
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/[[...route]]/route";
import { getRepositories } from "@/db/container";
import { RECONNECT_DELAY_MS } from "@/server/feed/routes";
import { RECONNECT_GRACE_MS } from "@/app/(site)/[eventSlug]/replica/sync-state";
import { connectionCount } from "@/server/feed/hub";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { updateLoggedSession } from "../helpers/changes";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";
import { credentialsChanged } from "@/server/kernel/credential-changes";
import { createPeopleUseCases } from "@/server/modules/people/module";
import { unitOfWork } from "@/server/kernel/unit-of-work";

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());
afterEach(() => vi.useRealTimers());

async function setup() {
  const event = await createEvent();
  const session = await createSession(event.id, { title: "Talk" });
  await updateLoggedSession(session.id, { title: "One" });
  return { event, session };
}

function open(
  slug: string,
  query = "",
  headers: Record<string, string> = {},
  signal?: AbortSignal
) {
  return GET(
    new NextRequest(`http://test/api/v1/events/${slug}/feed${query}`, {
      headers,
      signal,
    })
  );
}

function reader(res: Response) {
  const r = res.body!.getReader();
  const decoder = new TextDecoder();
  let first = true;
  return {
    async next({ raw = false } = {}): Promise<string | null> {
      const { value, done } = await r.read();
      if (done) return null;
      const text = decoder.decode(value);
      const wasFirst = first;
      first = false;
      return wasFirst && !raw ? text.replace(/^retry: \d+\n/, "") : text;
    },
    cancel: () => r.cancel(),
  };
}

describe("GET /events/{slug}/feed", () => {
  it("tells the browser to reconnect before the client shows Reconnecting", async () => {
    const { event } = await setup();
    const stream = reader(await open(event.slug, "?since=0"));

    const first = (await stream.next({ raw: true }))!;
    const delay = Number(/^retry: (\d+)\n/.exec(first)![1]);
    expect(delay).toBe(RECONNECT_DELAY_MS);
    expect(delay).toBeLessThan(RECONNECT_GRACE_MS);
    await stream.cancel();
  });

  it("streams the logged changes after ?since=, then live ones", async () => {
    const { event, session } = await setup();
    const res = await open(event.slug, "?since=0");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/event-stream");
    expect(res.headers.get("cache-control")).toBe("no-store, no-transform");
    expect(res.headers.get("x-accel-buffering")).toBe("no");
    const stream = reader(res);
    const first = (await stream.next())!;
    const [firstChange] = await getRepositories().changes.listAfter(0);
    expect(first).toMatch(
      new RegExp(`^id: ${firstChange.seq}\nevent: session.changed\ndata: \\{`)
    );

    await updateLoggedSession(session.id, { title: "Two" });
    const live = (await stream.next())!;
    expect(live).toContain(`id: ${firstChange.seq + 1}\n`);
    expect(live).toContain('"title":"Two"');
    await stream.cancel();
  });

  it("lets Last-Event-ID win over ?since=", async () => {
    const { event, session } = await setup();
    await updateLoggedSession(session.id, { title: "Two" });
    const [one, two] = await getRepositories().changes.listAfter(0);

    const res = await open(event.slug, "?since=0", {
      "last-event-id": String(one.seq),
    });

    const stream = reader(res);
    expect(await stream.next()).toContain(`id: ${two.seq}\n`);
    await stream.cancel();
  });

  it("answers 400 without a resume point and 404 for an unknown event", async () => {
    const { event } = await setup();

    const missing = await open(event.slug);
    expect(missing.status).toBe(400);
    expect(((await missing.json()) as { code: string }).code).toBe(
      "feed.sinceMissing"
    );
    const invalid = await open(event.slug, "?since=abc");
    expect(invalid.status).toBe(400);
    expect(((await invalid.json()) as { code: string }).code).toBe(
      "feed.sinceInvalid"
    );
    expect((await open("nope", "?since=0")).status).toBe(404);
  });

  it("sends a reset and ends when the resume point is ahead of the log", async () => {
    const { event } = await setup();
    const stream = reader(await open(event.slug, "?since=999"));

    expect(await stream.next()).toBe("event: reset\ndata: {}\n\n");
    expect(await stream.next()).toBeNull();
  });

  it("stops listening when the client goes away", async () => {
    const { event } = await setup();
    const before = connectionCount();
    const stream = reader(await open(event.slug, "?since=0"));
    await stream.next();
    expect(connectionCount()).toBe(before + 1);

    await stream.cancel();

    expect(connectionCount()).toBe(before);
  });

  it("stops listening when the request is aborted, even before it opens", async () => {
    const { event } = await setup();
    const before = connectionCount();
    const controller = new AbortController();
    const stream = reader(
      await open(event.slug, "?since=0", {}, controller.signal)
    );
    await stream.next();
    controller.abort();
    expect(connectionCount()).toBe(before);

    const aborted = new AbortController();
    aborted.abort();
    await open(event.slug, "?since=0", {}, aborted.signal);
    expect(connectionCount()).toBe(before);
  });

  it("sends a ping event every 25 seconds, and ends after 10 minutes", async () => {
    const { event } = await setup();
    const [last] = (await getRepositories().changes.listAfter(0)).slice(-1);
    vi.useFakeTimers({
      toFake: ["setInterval", "setTimeout", "clearInterval", "clearTimeout"],
    });
    const stream = reader(await open(event.slug, `?since=${last.seq}`));

    const beat = stream.next();
    await vi.advanceTimersByTimeAsync(25_000);
    expect(await beat).toBe("event: ping\ndata: {}\n\n");

    const end = (async () => {
      while ((await stream.next()) !== null) {
        // drain until the stream ends
      }
      return true;
    })();
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(await end).toBe(true);
  });

  async function drain(stream: ReturnType<typeof reader>): Promise<string[]> {
    const chunks: string[] = [];
    for (let c = await stream.next(); c !== null; c = await stream.next())
      chunks.push(c);
    return chunks;
  }

  it("closes a client whose unsent data passes 1 MB, and resumes without a gap", async () => {
    const { event, session } = await setup();
    const big = "x".repeat(600_000);
    for (const description of [big, big + "1", big + "2"])
      await updateLoggedSession(session.id, { description });
    const logged = (await getRepositories().changes.listAfter(0)).map(
      (c) => c.seq
    );

    const received: number[] = [];
    let lastId = 0;
    for (let reconnects = 0; received.length < logged.length; reconnects++) {
      expect(reconnects).toBeLessThan(logged.length);
      const stream = reader(
        await open(event.slug, "", { "last-event-id": String(lastId) })
      );
      const chunks: string[] = [];
      for (let c = await stream.next(); c !== null; c = await stream.next()) {
        chunks.push(c);
        lastId = Number(/^id: (\d+)/.exec(c)![1]);
        received.push(lastId);
        if (lastId === logged.at(-1)) break;
      }
      await stream.cancel();
      if (reconnects === 0) expect(chunks.length).toBeLessThan(logged.length);
    }

    expect(received).toEqual(logged);
  });

  describe("when a guest's credentials change or the guest is deleted", () => {
    async function guestStream() {
      const { event } = await setup();
      const guest = await createGuest({ eventId: event.id });
      const res = await open(event.slug, "?since=0", {
        cookie: `${GUEST_COOKIE_NAME}=${openGuestValue(guest.id)}`,
      });
      const stream = reader(res);
      await stream.next();
      return { event, guest, stream };
    }

    it("ends that guest's streams only", async () => {
      const { event, guest, stream } = await guestStream();
      const other = reader(await open(event.slug, "?since=0"));
      await other.next();

      credentialsChanged(guest.id);

      expect(await stream.next()).toBeNull();
      expect(connectionCount()).toBe(1);
      await other.cancel();
    });

    it("ends the stream of a deleted guest", async () => {
      const { guest, stream } = await guestStream();
      const people = createPeopleUseCases({
        repos: getRepositories(),
        avatars: {
          validate: (buffer) => Promise.resolve({ buffer, ext: "png" }),
          saveNew: (id) => Promise.resolve(`/media/avatars/${id}-1.png`),
          deleteByUrl: async () => {},
        },
        sendTestEmail: async () => {},
        uow: unitOfWork,
      });

      await people.deleteGuest(
        { admin: true, guest: null },
        { id: guest.id },
        new Date()
      );

      await drain(stream);
      expect(connectionCount()).toBe(0);
    });
  });
});
