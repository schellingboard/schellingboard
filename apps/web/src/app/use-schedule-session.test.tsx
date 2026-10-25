// @module-tag 007-US8
import { describe, expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { fakeApi, problem } from "../commands/fake-api";
import { createReplicaPersistence } from "../replica/persistence";
import { snapshot } from "../replica/snapshot-fixture";
import { removeRsvp } from "../commands/rsvp";
import { NoticeProvider } from "../ui/notices";
import { useScheduleSession } from "./use-schedule-session";

class FakeSource {
  closed = false;
  readyState = 1;
  constructor(readonly url: string) {}
  addEventListener() {}
  close() {
    this.closed = true;
  }
}

function setup(
  viewer: string | null | undefined,
  respond: (path: string) => Response = () => Response.json(snapshot)
) {
  const { api, calls } = fakeApi((call) => respond(call.path));
  const sources: FakeSource[] = [];
  const persistence = createReplicaPersistence(new IDBFactory());
  const hook = renderHook(
    ({ viewer }) =>
      useScheduleSession({
        api,
        slug: "conf",
        viewer,
        persistence,
        createSource: (url) => {
          const source = new FakeSource(url);
          sources.push(source);
          return source as unknown as EventSource;
        },
      }),
    { initialProps: { viewer }, wrapper: NoticeProvider }
  );
  return { ...hook, calls, sources };
}

describe("useScheduleSession", () => {
  it("waits for the viewer to be known before loading anything", () => {
    const { result, calls } = setup(undefined);
    expect(result.current.status).toBe("loading");
    expect(calls).toEqual([]);
  });

  it("loads the event's snapshot and follows its feed", async () => {
    const { result, calls, sources } = setup("mia");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(calls[0].path).toBe("/api/v1/events/conf/snapshot");
    if (result.current.status !== "ready") throw new Error("not ready");
    expect(result.current.runner.view().event.slug).toBe("conf");
    expect(sources[0].url).toBe("/api/v1/events/conf/feed?since=7");
  });

  it("closes the feed and opens a new session when the viewer changes", async () => {
    const { result, rerender, sources, calls } = setup("mia");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    const first = result.current;

    rerender({ viewer: "kai" });

    expect(sources[0].closed).toBe(true);
    await waitFor(() => expect(sources).toHaveLength(2));
    await waitFor(() =>
      expect(
        result.current.status === "ready" && result.current !== first
      ).toBe(true)
    );
    expect(calls.filter((c) => c.path.endsWith("/snapshot"))).toHaveLength(2);
  });

  it("says when the event does not exist", async () => {
    const { result } = setup("mia", () => problem(404, "event.notFound"));
    await waitFor(() => expect(result.current.status).toBe("missing"));
  });

  it("offers a retry when loading fails", async () => {
    let fail = true;
    const { result } = setup("mia", () =>
      fail ? problem(500, "server.error") : Response.json(snapshot)
    );
    await waitFor(() => expect(result.current.status).toBe("failed"));
    fail = false;
    act(() => {
      if (result.current.status === "failed") result.current.retry();
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
  });

  it("stops its feed on unmount", async () => {
    const { result, unmount, sources } = setup("mia");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    unmount();
    expect(sources[0].closed).toBe(true);
  });

  it("tells the viewer which command failed and why", async () => {
    const { result } = setup("mia", (path) =>
      path.endsWith("/snapshot")
        ? Response.json(snapshot)
        : problem(409, "event.notSchedulingPhase")
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("not ready");

    const { runner } = result.current;
    await act(() => runner.run(removeRsvp, { sessionId: "s" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Could not withdraw your RSVP to “");
    expect(alert.textContent).toContain("scheduling phase");
  });
});
