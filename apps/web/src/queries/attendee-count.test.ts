// @module-tag 001-US1
import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { attendeeCountApi } from "./attendee-count";

describe("attendeeCountApi", () => {
  it("loads the recorded count", async () => {
    const { api, calls } = fakeApi(() => Response.json({ count: 12 }));
    expect(await attendeeCountApi(api, () => "k").load("s1")).toEqual({
      ok: true,
      count: 12,
    });
    expect(calls[0].path).toBe("/api/v1/sessions/s1/attendee-count");
  });

  it("saves a count, or null to clear it, with an idempotency key", async () => {
    const { api, calls } = fakeApi(() => Response.json({ count: null }));
    const result = await attendeeCountApi(api, () => "k1").save("s1", null);
    expect(result).toEqual({ ok: true, count: null });
    expect(calls[0]).toMatchObject({
      method: "PUT",
      key: "k1",
      body: { count: null },
    });
  });

  it("says the range when the server rejects the value", async () => {
    const { api } = fakeApi(() => problem(400, "attendeeCount.invalid"));
    const result = await attendeeCountApi(api, () => "k").save("s1", 5000);
    expect(result).toEqual({
      ok: false,
      message: "Enter a whole number between 0 and 1000",
    });
  });

  it("falls back to a retry message for anything else, a lost network included", async () => {
    const { api } = fakeApi(() => problem(500, "internal"));
    expect(await attendeeCountApi(api, () => "k").save("s1", 1)).toEqual({
      ok: false,
      message: "Could not save — try again",
    });
    const offline = fakeApi(() => Promise.reject(new TypeError("offline")));
    expect(await attendeeCountApi(offline.api, () => "k").load("s1")).toEqual({
      ok: false,
      message: "Could not load the count — try again",
    });
  });
});
