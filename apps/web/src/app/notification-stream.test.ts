// @module-tag 013-US1
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  connectNotificationStream,
  NOTIFICATION_SILENCE_MS,
} from "./notification-stream";

afterEach(() => vi.useRealTimers());

class FakeSource {
  closed = false;
  readyState = 1;
  private listeners = new Map<string, (event: { data: string }) => void>();
  constructor(readonly url: string) {}
  addEventListener(type: string, listener: (event: { data: string }) => void) {
    this.listeners.set(type, listener);
  }
  close() {
    this.closed = true;
  }
  emit(type: string, data: unknown = {}) {
    this.listeners.get(type)?.({ data: JSON.stringify(data) });
  }
}

function connect(visibility: { state: string } = { state: "visible" }) {
  const sources: FakeSource[] = [];
  const unread: Array<[number, boolean]> = [];
  const unavailable = vi.fn();
  const listeners = new Set<() => void>();
  const doc = {
    get visibilityState() {
      return visibility.state;
    },
    addEventListener: (_type: string, listener: unknown) =>
      void listeners.add(listener as () => void),
    removeEventListener: (_type: string, listener: unknown) =>
      void listeners.delete(listener as () => void),
  };
  const stream = connectNotificationStream({
    createSource: (url) => {
      const source = new FakeSource(url);
      sources.push(source);
      return source;
    },
    onUnread: (count, initial) => unread.push([count, initial]),
    onUnavailable: unavailable,
    doc,
  });
  return {
    stream,
    sources,
    unread,
    unavailable,
    changeVisibility: (state: string) => {
      visibility.state = state;
      listeners.forEach((l) => l());
    },
  };
}

describe("the notification stream", () => {
  it("reports each unread count the server sends", () => {
    const { sources, unread } = connect();

    expect(sources[0].url).toBe("/api/v1/me/notifications/stream");
    sources[0].emit("unread", { unreadCount: 2 });
    sources[0].emit("unread", { unreadCount: 0 });

    expect(unread).toEqual([
      [2, true],
      [0, false],
    ]);
  });

  it("ignores a message it cannot read", () => {
    const { sources, unread } = connect();

    sources[0].emit("unread", { unreadCount: "many" });

    expect(unread).toEqual([]);
  });

  it("gives up, and says so, when the server refuses the stream", () => {
    const { sources, unavailable } = connect();

    sources[0].readyState = 2;
    sources[0].emit("error");

    expect(unavailable).toHaveBeenCalledOnce();
  });

  it("leaves a dropped connection to the browser's own reconnect", () => {
    const { sources, unavailable } = connect();

    sources[0].emit("error");

    expect(unavailable).not.toHaveBeenCalled();
  });

  it("closes after the tab has been hidden a while and opens again when it is shown", () => {
    vi.useFakeTimers();
    const { sources, changeVisibility } = connect();

    changeVisibility("hidden");
    vi.advanceTimersByTime(30_000);
    expect(sources[0].closed).toBe(true);

    changeVisibility("visible");
    expect(sources).toHaveLength(2);
  });

  it("stays open through a short switch away", () => {
    vi.useFakeTimers();
    const { sources, changeVisibility } = connect();

    changeVisibility("hidden");
    vi.advanceTimersByTime(5_000);
    changeVisibility("visible");
    vi.advanceTimersByTime(20_000);

    expect(sources).toHaveLength(1);
    expect(sources[0].closed).toBe(false);
  });

  it("reconnects when the server has gone quiet", () => {
    vi.useFakeTimers();
    const { sources } = connect();

    vi.advanceTimersByTime(NOTIFICATION_SILENCE_MS);

    expect(sources[0].closed).toBe(true);
    expect(sources).toHaveLength(2);
  });

  it("stays connected while pings arrive", () => {
    vi.useFakeTimers();
    const { sources } = connect();

    for (let i = 0; i < 4; i++) {
      vi.advanceTimersByTime(NOTIFICATION_SILENCE_MS - 1_000);
      sources[0].emit("ping");
    }

    expect(sources).toHaveLength(1);
  });

  it("closes for good when stopped", () => {
    const { stream, sources } = connect();

    stream.stop();

    expect(sources[0].closed).toBe(true);
  });
});
