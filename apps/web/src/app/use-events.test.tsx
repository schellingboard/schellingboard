// @module-tag 002-US2
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { fakeApi } from "../commands/fake-api";
import { snapshot } from "../replica/snapshot-fixture";
import { type EventSummary, useEventList, useEvents } from "./use-events";

afterEach(cleanup);

const event = (slug: string, firstDayStart: string | null): EventSummary => ({
  ...snapshot.event,
  slug,
  name: slug,
  firstDayStart,
});

const api = () =>
  fakeApi(() =>
    Response.json({
      now: "2026-05-01T00:00:00Z",
      events: [
        event("late", "2026-09-10T08:00:00Z"),
        event("undated", null),
        event("early", "2026-06-01T08:00:00Z"),
      ],
    })
  ).api;

describe("the list of events", () => {
  it("comes soonest first, undated last", async () => {
    const { result } = renderHook(() => useEventList(api()));

    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.events.map((e) => e.slug)).toEqual([
      "early",
      "late",
      "undated",
    ]);
  });

  it("is in the same order in the menu", async () => {
    const client = api();
    const { result } = renderHook(() => useEvents(client, (s) => `/${s}`));

    await waitFor(() => expect(result.current).toHaveLength(3));
    expect(result.current.map((e) => e.name)).toEqual([
      "early",
      "late",
      "undated",
    ]);
  });
});
