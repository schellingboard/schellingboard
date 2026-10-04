// @module-tag 019-US2
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { getRepositories } from "@/db/container";
import { createApp } from "@/server/http/create-app";
import { actorMiddleware } from "@/server/http/actor";
import { idempotencyMiddleware } from "@/server/http/idempotency";
import { pruneIdempotencyKeys } from "@/utils/jobs/idempotency";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";

const T0 = new Date("2026-06-01T10:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;

let now = T0;
let calls = 0;
let gate: Promise<void> | null = null;
let failNext = false;

function testApp() {
  const app = createApp();
  app.use("*", actorMiddleware);
  app.use(
    "*",
    idempotencyMiddleware({
      store: () => getRepositories().idempotency,
      now: () => now,
    })
  );
  app.post("/things", async (c) => {
    calls += 1;
    if (gate) await gate;
    if (failNext) {
      failNext = false;
      throw new Error("boom");
    }
    const body: unknown = await c.req.json();
    c.header("location", `/things/${calls}`);
    return c.json({ call: calls, body }, 201);
  });
  app.delete("/things/1", (c) => {
    calls += 1;
    return c.body(null, 204);
  });
  return app;
}

function post(
  app: ReturnType<typeof testApp>,
  key: string | null,
  body: unknown = { name: "a" },
  { path = "/things", guest = "g1", cookie = openGuestValue(guest) } = {}
) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    cookie: `${GUEST_COOKIE_NAME}=${cookie}`,
  };
  if (key !== null) headers["idempotency-key"] = key;
  return app.request(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("Idempotency-Key", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    now = T0;
    calls = 0;
    gate = null;
    failNext = false;
  });

  it("answers a retry with the stored response without running it again", async () => {
    const app = testApp();
    const first = await post(app, "k1");
    const retry = await post(app, "k1");

    expect(calls).toBe(1);
    expect(retry.status).toBe(201);
    expect(retry.headers.get("content-type")).toBe(
      first.headers.get("content-type")
    );
    expect(retry.headers.get("location")).toBe("/things/1");
    expect(await retry.json()).toEqual(await first.json());
  });

  it("replays a response without a body", async () => {
    const app = testApp();
    const init = { method: "DELETE", headers: { "idempotency-key": "k1" } };
    await app.request("/things/1", init);
    const retry = await app.request("/things/1", init);
    expect(calls).toBe(1);
    expect(retry.status).toBe(204);
    expect(await retry.text()).toBe("");
  });

  it("runs every request that carries no key", async () => {
    const app = testApp();
    await post(app, null);
    await post(app, null);
    expect(calls).toBe(2);
  });

  it("keeps one actor's key apart from another's", async () => {
    const app = testApp();
    await post(app, "k1", { name: "a" }, { guest: "g1" });
    const other = await post(app, "k1", { name: "b" }, { guest: "g2" });
    expect(other.status).toBe(201);
    expect(calls).toBe(2);
  });

  it("keeps a verified guest's key apart from an open cookie naming them", async () => {
    const app = testApp();
    const cookie = await verifiedGuestValue("g1");
    await post(app, "k1", { name: "a" }, { cookie });
    const forged = await post(app, "k1");
    expect(forged.status).toBe(201);
    expect(calls).toBe(2);
  });

  it.each([
    ["a different body", { name: "b" }, "/things"],
    ["a different path", { name: "a" }, "/elsewhere"],
    ["a different query", { name: "a" }, "/things?draft=1"],
  ])("refuses the key reused with %s", async (_, body, path) => {
    const app = testApp();
    await post(app, "k1");
    const reused = await post(app, "k1", body, { path });
    expect(reused.status).toBe(422);
    expect(reused.headers.get("content-type")).toBe("application/problem+json");
    expect(await reused.json()).toMatchObject({
      status: 422,
      code: "idempotency.keyReused",
    });
    expect(calls).toBe(1);
  });

  it("refuses the key reused with a different method", async () => {
    const app = testApp();
    await post(app, "k1");
    const reused = await app.request("/things/1", {
      method: "DELETE",
      headers: {
        "idempotency-key": "k1",
        cookie: `${GUEST_COOKIE_NAME}=${openGuestValue("g1")}`,
      },
    });
    expect(reused.status).toBe(422);
    expect(calls).toBe(1);
  });

  it("refuses a retry while the first request is still running", async () => {
    const app = testApp();
    let open = () => {};
    gate = new Promise((resolve) => (open = resolve));
    const first = post(app, "k1");
    await vi.waitFor(() => expect(calls).toBe(1));

    const concurrent = await post(app, "k1");
    expect(concurrent.status).toBe(409);
    expect(await concurrent.json()).toMatchObject({
      code: "idempotency.inProgress",
    });

    open();
    expect((await first).status).toBe(201);
    expect(calls).toBe(1);
  });

  it("runs a retry again once the first request was abandoned", async () => {
    const app = testApp();
    gate = new Promise(() => {});
    void post(app, "k1");
    await vi.waitFor(() => expect(calls).toBe(1));
    gate = null;

    now = new Date(T0.getTime() + 61 * 1000);
    expect((await post(app, "k1")).status).toBe(201);
    expect(calls).toBe(2);
  });

  it("keeps the retry's claim when the abandoned request fails late", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const app = testApp();
    let openFirst = () => {};
    gate = new Promise((resolve) => (openFirst = resolve));
    const first = post(app, "k1");
    await vi.waitFor(() => expect(calls).toBe(1));

    now = new Date(T0.getTime() + 61 * 1000);
    let openRetry = () => {};
    gate = new Promise((resolve) => (openRetry = resolve));
    const retry = post(app, "k1");
    await vi.waitFor(() => expect(calls).toBe(2));

    failNext = true;
    openFirst();
    expect((await first).status).toBe(500);

    gate = null;
    expect((await post(app, "k1")).status).toBe(409);
    openRetry();
    expect((await retry).status).toBe(201);
    expect(calls).toBe(2);
  });

  it("runs a retry again after a server error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const app = testApp();
    failNext = true;
    expect((await post(app, "k1")).status).toBe(500);
    expect((await post(app, "k1")).status).toBe(201);
    expect(calls).toBe(2);
  });

  it("refuses a key longer than 255 characters", async () => {
    const app = testApp();
    const res = await post(app, "k".repeat(256));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "request.invalid" });
    expect(calls).toBe(0);
  });

  it("forgets a key after 24 hours", async () => {
    const app = testApp();
    await post(app, "k1");
    now = new Date(T0.getTime() + 24 * HOUR_MS + 1);
    const later = await post(app, "k1", { name: "b" });
    expect(later.status).toBe(201);
    expect(calls).toBe(2);
  });

  it("is pruned by the jobs loop once older than 24 hours", async () => {
    const app = testApp();
    await post(app, "k1");

    await pruneIdempotencyKeys.run(new Date(T0.getTime() + 23 * HOUR_MS));
    expect((await post(app, "k1", { name: "b" })).status).toBe(422);

    await pruneIdempotencyKeys.run(new Date(T0.getTime() + 25 * HOUR_MS));
    expect((await post(app, "k1", { name: "b" })).status).toBe(201);
  });
});
