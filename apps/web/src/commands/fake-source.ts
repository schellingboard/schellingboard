/** An `EventSource` a test drives by hand. */
export class FakeSource {
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

/** A `createSource` that keeps what it opened, split by kind. */
export function fakeSources() {
  const feeds: FakeSource[] = [];
  const notifications: FakeSource[] = [];
  return {
    feeds,
    notifications,
    createSource: (url: string) => {
      const source = new FakeSource(url);
      (url.includes("/me/notifications/") ? notifications : feeds).push(source);
      return source as unknown as EventSource;
    },
  };
}
