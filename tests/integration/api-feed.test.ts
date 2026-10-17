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
import { connectionCount } from "@/server/feed/hub";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { updateLoggedSession } from "../helpers/changes";
import { createEvent, createSession } from "../helpers/factories";

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
  return {
    async next(): Promise<string | null> {
      const { value, done } = await r.read();
      return done ? null : decoder.decode(value);
    },
    cancel: () => r.cancel(),
  };
}

describe("GET /events/{slug}/feed", () => {
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

  it("sends a heartbeat comment every 25 seconds, and ends after 10 minutes", async () => {
    const { event } = await setup();
    const [last] = (await getRepositories().changes.listAfter(0)).slice(-1);
    vi.useFakeTimers({
      toFake: ["setInterval", "setTimeout", "clearInterval", "clearTimeout"],
    });
    const stream = reader(await open(event.slug, `?since=${last.seq}`));

    const beat = stream.next();
    await vi.advanceTimersByTimeAsync(25_000);
    expect(await beat).toBe(": keepalive\n\n");

    const end = (async () => {
      while ((await stream.next()) !== null) {
        // drain until the stream ends
      }
      return true;
    })();
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(await end).toBe(true);
  });
});
