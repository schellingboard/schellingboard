import { IDBFactory } from "fake-indexeddb";
import { render } from "@testing-library/react";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { fakeApi, problem, type FakeCall } from "../commands/fake-api";
import { createReplicaPersistence } from "../replica/persistence";
import { iso, snapshot } from "../replica/snapshot-fixture";
import { createAppRouter } from "./router";
import type { AppServices } from "./services";

class FakeSource {
  closed = false;
  readyState = 1;
  constructor(readonly url: string) {}
  addEventListener() {}
  close() {
    this.closed = true;
  }
}

// The fixture's own clock is before its scheduling phase.
export const running: Snapshot = { ...snapshot, now: iso(9) };

export type Setup = {
  handler?: (call: FakeCall) => Response | undefined;
  snapshot?: Snapshot | Response;
  identity?: string | null;
  path?: string;
};

export async function open({
  handler,
  snapshot: snap = running,
  identity = "mia",
  path = "/conf",
}: Setup = {}) {
  const sources: FakeSource[] = [];
  const { api, calls } = fakeApi((call) => {
    const custom = handler?.(call);
    if (custom) return custom;
    if (call.path === "/api/v1/health")
      return Response.json({
        status: "ok",
        version: "4.1.0",
        buildId: "b",
        devTools: false,
      });
    if (call.path === "/api/v1/me/identity" && call.method === "PUT")
      return Response.json({
        guestId: (call.body as { guestId: string }).guestId,
      });
    if (call.path === "/api/v1/me/identity")
      return Response.json({ guestId: identity });
    if (call.path === "/api/v1/events")
      return Response.json({
        events: [
          { ...snapshot.event },
          { ...snapshot.event, id: "e2", slug: "other", name: "Other con" },
        ],
      });
    if (call.path === "/api/v1/events/conf/snapshot")
      return snap instanceof Response ? snap : Response.json(snap);
    if (call.method === "DELETE" && call.path.includes("/rsvps/"))
      return new Response(null, { status: 204 });
    return problem(404, "not.found");
  });
  const services: AppServices = {
    api,
    persistence: createReplicaPersistence(new IDBFactory()),
    createSource: (url) => {
      const source = new FakeSource(url);
      sources.push(source);
      return source as unknown as EventSource;
    },
  };
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
    services
  );
  await router.load();
  render(<RouterProvider router={router} />);
  return { calls, sources, router };
}
