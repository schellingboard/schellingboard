import { notificationStreamMessageSchema } from "@schellingboard/contracts/notification";

type Source = {
  addEventListener(
    type: string,
    listener: (event: { data: string }) => void
  ): void;
  close(): void;
  readyState: number;
};

const STREAM_URL = "/api/v1/me/notifications/stream";
const CLOSED = 2;
const RETRY_MS = 2000;
const MAX_RETRY_MS = 60_000;
// Two missed server pings: a dead connection raises no error (sleep, a
// network change).
export const NOTIFICATION_SILENCE_MS = 50_000;
// A hidden tab holds no connection; a short switch away keeps it.
const HIDDEN_CLOSE_MS = 30_000;

/**
 * The server's word on the viewer's unread count. Each connection opens with
 * the current count, so nothing missed while disconnected is lost.
 */
export function connectNotificationStream({
  createSource,
  onUnread,
  doc = document,
}: {
  createSource: (url: string) => Source;
  /** `initial` is the very first count, which only says where things stand. */
  onUnread: (count: number, initial: boolean) => void;
  doc?: Pick<Document, "addEventListener" | "removeEventListener"> & {
    visibilityState: string;
  };
}) {
  let source: Source | null = null;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let hiddenTimer: ReturnType<typeof setTimeout> | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;
  let stopped = false;
  let heardCount = false;

  const close = () => {
    clearTimeout(watchdog);
    clearTimeout(retry);
    source?.close();
    source = null;
  };

  function open() {
    close();
    const current = createSource(STREAM_URL);
    source = current;
    const heard = () => {
      if (current !== source) return;
      clearTimeout(watchdog);
      watchdog = setTimeout(() => {
        if (current === source && !stopped) open();
      }, NOTIFICATION_SILENCE_MS);
    };
    const alive = () => {
      failures = 0;
      heard();
    };
    heard();
    current.addEventListener("unread", ({ data }) => {
      alive();
      const message = parse(data);
      if (message === null) return;
      onUnread(message, !heardCount);
      heardCount = true;
    });
    current.addEventListener("ping", alive);
    current.addEventListener("open", alive);
    // The browser reconnects by itself unless the server refused the stream
    // (a 502 while it restarts, say), which closes it for good.
    current.addEventListener("error", () => {
      if (current !== source || current.readyState !== CLOSED) return;
      close();
      retry = setTimeout(
        () => {
          if (!stopped && doc.visibilityState !== "hidden") open();
        },
        Math.min(RETRY_MS * 2 ** failures++, MAX_RETRY_MS)
      );
    });
  }

  const visibility = () => {
    clearTimeout(hiddenTimer);
    if (doc.visibilityState === "hidden") {
      hiddenTimer = setTimeout(close, HIDDEN_CLOSE_MS);
    } else if (!source && !stopped) {
      open();
    }
  };
  doc.addEventListener("visibilitychange", visibility);
  open();

  return {
    stop() {
      stopped = true;
      clearTimeout(hiddenTimer);
      doc.removeEventListener("visibilitychange", visibility);
      close();
    },
  };
}

function parse(data: string): number | null {
  try {
    const parsed = notificationStreamMessageSchema.safeParse(JSON.parse(data));
    return parsed.success ? parsed.data.unreadCount : null;
  } catch {
    return null;
  }
}
