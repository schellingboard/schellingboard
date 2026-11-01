import { describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
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
  localStorage.clear();
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

  it("asks the server again who the browser acts as", async () => {
    let who: Who = "g1";
    const { viewer } = setup(null, () => Response.json({ guestId: who }));
    await screen.findByText("as g1");
    who = null;

    await act(async () => {
      await viewer().refresh();
    });

    expect(await screen.findByText("as null")).toBeTruthy();
  });

  it("keeps the known viewer when asking again fails", async () => {
    let offline = false;
    const { viewer } = setup(null, () => {
      if (offline) throw new TypeError("offline");
      return Response.json({ guestId: "g1" });
    });
    await screen.findByText("as g1");
    offline = true;

    await act(async () => {
      await viewer().refresh();
    });

    expect(screen.getByText("as g1")).toBeTruthy();
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
      method: "POST",
      path: "/api/v1/auth/sign-out",
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

  it("keeps the name taken while the first answer was still on its way", async () => {
    let answerFirst!: () => void;
    const slow = new Promise<void>((resolve) => (answerFirst = resolve));
    const { viewer } = setup(null, async (call) => {
      if (call.method === "PUT")
        return Response.json({
          guestId: (call.body as { guestId: string }).guestId,
        });
      await slow;
      return Response.json({ guestId: null });
    });

    await act(async () => {
      await viewer().choose("g2");
    });
    await act(async () => {
      answerFirst();
      await slow;
    });

    expect(await screen.findByText("as g2")).toBeTruthy();
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

  describe("with the server out of reach", () => {
    const unreachable = () => {
      throw new TypeError("offline");
    };

    const offline = () =>
      render(
        <ViewerProvider api={fakeApi(unreachable).api} persistence={{ clear }}>
          <Probe onViewer={() => {}} />
        </ViewerProvider>
      );

    it("acts as the name last known on this device", async () => {
      setup("g1");
      await screen.findByText("as g1");
      cleanup();

      offline();
      expect(await screen.findByText("as g1")).toBeTruthy();
    });

    it("does not act as the remembered name when the server answers with an error", async () => {
      setup("g1");
      await screen.findByText("as g1");
      cleanup();

      render(
        <ViewerProvider
          api={fakeApi(() => new Response(null, { status: 429 })).api}
          persistence={{ clear }}
        >
          <Probe onViewer={() => {}} />
        </ViewerProvider>
      );
      await new Promise((r) => setTimeout(r, 20));
      expect(screen.getByText("loading")).toBeTruthy();
    });

    it("remembers an anonymous viewer too", async () => {
      setup(null);
      await screen.findByText("as null");
      cleanup();

      offline();
      expect(await screen.findByText("as null")).toBeTruthy();
    });

    it("remembers the name taken after the first answer", async () => {
      const { viewer } = setup(null);
      await screen.findByText("as null");
      await act(async () => {
        await viewer().choose("g2");
      });
      cleanup();

      offline();
      expect(await screen.findByText("as g2")).toBeTruthy();
    });
  });
});
