import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { fakeApi, problem } from "../commands/fake-api";
import { useViewer, ViewerProvider } from "./viewer";

type Who = string | null;

function Probe({
  onViewer,
}: {
  onViewer: (v: ReturnType<typeof useViewer>) => void;
}) {
  const viewer = useViewer();
  onViewer(viewer);
  return (
    <p>{viewer.guestId === undefined ? "loading" : `as ${viewer.guestId}`}</p>
  );
}

const clear = vi.fn().mockResolvedValue(undefined);

function setup(who: Who, handler?: Parameters<typeof fakeApi>[0]) {
  clear.mockClear();
  const fake = fakeApi(
    handler ??
      ((call) => {
        if (call.method === "PUT")
          return Response.json({
            guestId: (call.body as { guestId: string }).guestId,
          });
        if (call.method === "DELETE") return Response.json({ guestId: null });
        return Response.json({ guestId: who });
      })
  );
  let latest!: ReturnType<typeof useViewer>;
  render(
    <ViewerProvider api={fake.api} persistence={{ clear }}>
      <Probe onViewer={(v) => (latest = v)} />
    </ViewerProvider>
  );
  return { ...fake, viewer: () => latest };
}

describe("ViewerProvider", () => {
  it("does not know the viewer until the server has answered", async () => {
    setup("g1");
    expect(screen.getByText("loading")).toBeTruthy();
    expect(await screen.findByText("as g1")).toBeTruthy();
  });

  it("knows an anonymous viewer as null", async () => {
    setup(null);
    expect(await screen.findByText("as null")).toBeTruthy();
  });

  it("takes the name the server accepts", async () => {
    const { viewer, calls } = setup(null);
    await screen.findByText("as null");

    let result: unknown;
    await act(async () => {
      result = await viewer().choose("g2");
    });

    expect(result).toEqual({ ok: true });
    expect(await screen.findByText("as g2")).toBeTruthy();
    expect(calls.at(-1)).toMatchObject({
      method: "PUT",
      path: "/api/v1/me/identity",
      body: { guestId: "g2" },
    });
  });

  it("reports a protected name without changing the viewer", async () => {
    const { viewer } = setup(null, (call) =>
      call.method === "PUT"
        ? problem(403, "guest.protected")
        : Response.json({ guestId: null })
    );
    await screen.findByText("as null");

    let result: unknown;
    await act(async () => {
      result = await viewer().choose("g3");
    });

    expect(result).toEqual({ ok: false, code: "guest.protected" });
    expect(screen.getByText("as null")).toBeTruthy();
  });

  it("signs out", async () => {
    const { viewer, calls } = setup("g1");
    await screen.findByText("as g1");

    await act(async () => {
      await viewer().signOut();
    });

    await waitFor(() => expect(screen.getByText("as null")).toBeTruthy());
    expect(calls.at(-1)).toMatchObject({
      method: "DELETE",
      path: "/api/v1/me/identity",
    });
  });

  it("clears the device's copies of the schedule on sign-out", async () => {
    const { viewer } = setup("g1");
    await screen.findByText("as g1");

    await act(async () => {
      await viewer().signOut();
    });

    expect(clear).toHaveBeenCalled();
  });

  it("clears them when a signed-in viewer takes another name, not when an anonymous one picks", async () => {
    const { viewer } = setup(null);
    await screen.findByText("as null");
    await act(async () => {
      await viewer().choose("g2");
    });
    expect(clear).not.toHaveBeenCalled();

    await act(async () => {
      await viewer().choose("g3");
    });
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it("asks again when the first answer fails", async () => {
    vi.useFakeTimers();
    let calls = 0;
    setup("g1", () => {
      if (++calls === 1) throw new TypeError("offline");
      return Response.json({ guestId: "g1" });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    vi.useRealTimers();
    expect(screen.getByText("as g1")).toBeTruthy();
  });

  it("treats an unreachable server as unknown, not as signed out", async () => {
    setup("g1", () => {
      throw new TypeError("offline");
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByText("loading")).toBeTruthy();
  });
});
