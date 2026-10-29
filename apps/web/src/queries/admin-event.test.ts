import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createAdminEventQuery } from "./admin-event";

describe("the admin event detail", { tags: ["015-US2"] }, () => {
  it("holds the event and its days, and again after a reload", async () => {
    let version = 1;
    const { api, calls } = fakeApi(() =>
      Response.json({ event: { id: "e1", version }, days: [] })
    );
    const query = createAdminEventQuery({ api, id: "e1" });
    expect(query.get()).toEqual({ status: "loading" });

    await query.load();
    version = 2;
    await query.load();

    expect(calls[0].path).toBe("/api/v1/events/e1");
    expect(query.get()).toEqual({
      status: "ready",
      event: { id: "e1", version: 2 },
      days: [],
    });
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(404, "event.notFound"));
    const query = createAdminEventQuery({ api, id: "nope" });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "event.notFound" });
  });
});
