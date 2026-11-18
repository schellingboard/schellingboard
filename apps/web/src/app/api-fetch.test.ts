import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout, READ_TIMEOUT_MS } from "./api-fetch";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function hangingFetch() {
  return vi.fn(
    (request: Request) =>
      new Promise<Response>((_, reject) => {
        request.signal.addEventListener("abort", () =>
          reject(new Error("aborted"))
        );
      })
  );
}

describe("fetchWithTimeout", () => {
  it("fails a read that never gets an answer, so the screen can retry it", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", hangingFetch());

    const pending = fetchWithTimeout(
      new Request("http://x.test/api/v1/events")
    );
    const outcome = expect(pending).rejects.toBeDefined();
    await vi.advanceTimersByTimeAsync(READ_TIMEOUT_MS);

    await outcome;
  });

  it("leaves a write alone, since cutting it off could hide that it went through", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 204 }))
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithTimeout(
      new Request("http://x.test/api/v1/sessions", { method: "POST" })
    );

    expect(response.status).toBe(204);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("passes a read that answers in time", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("ok")))
    );

    const response = await fetchWithTimeout(new Request("http://x.test/a"));

    expect(await response.text()).toBe("ok");
  });
});
