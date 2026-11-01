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
import { GET } from "@/tests/helpers/v1-route";
import { getRepositories } from "@/db/container";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createDay, createEvent } from "../helpers/factories";

const get = (path: string) => GET(new NextRequest(`http://test/api/v1${path}`));

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/v1/events", () => {
  it(
    "lists the events and reads one with its days",
    { tags: ["019-US9"] },
    async () => {
      const event = await createEvent({ name: "Unconf" });
      const day = await createDay(event.id);

      const list = await get("/events");
      const one = await get(`/events/${event.id}`);

      expect(list.status).toBe(200);
      expect(await list.json()).toMatchObject({
        events: [{ id: event.id, name: "Unconf", slug: event.slug }],
      });
      expect(one.status).toBe(200);
      expect(await one.json()).toMatchObject({
        event: { id: event.id },
        days: [{ id: day.id, eventId: event.id }],
      });
    }
  );

  it("answers 404 for an unknown event", { tags: ["019-US9"] }, async () => {
    const res = await get("/events/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ code: "event.notFound" });
  });
});

describe("GET /api/v1/site", () => {
  it(
    "tells anyone the site's title, description and map",
    { tags: ["002-US2"] },
    async () => {
      await getRepositories().settings.update({
        title: "Unconf Hub",
        description: "All our events",
        mapImageUrl: "/media/maps/venue.webp",
      });

      const res = await get("/site");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        title: "Unconf Hub",
        description: "All our events",
        mapImageUrl: "/media/maps/venue.webp",
      });
    }
  );
});
