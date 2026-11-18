import { onCredentialsChanged } from "@/server/kernel/credential-changes";
import { onNotificationsChanged } from "@/server/kernel/notification-changes";
import type { NotificationStreamTarget } from "../application/notifications";

const HEARTBEAT_MS = 25_000;
// A connection that never ends could outlive a credential change; the browser
// reconnects at once and the first message carries the current count.
const MAX_AGE_MS = 10 * 60_000;
export const RECONNECT_DELAY_MS = 1000;

const encoder = new TextEncoder();

export function notificationStream(
  { guestId, unreadCount }: NotificationStreamTarget,
  signal: AbortSignal
): ReadableStream<Uint8Array> {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let finished = false;
  let reading = false;
  let again = false;
  let preamble = `retry: ${RECONNECT_DELAY_MS}\n`;
  const cleanup: Array<() => void> = [];

  const write = (text: string) => {
    if (finished) return;
    controller.enqueue(encoder.encode(preamble + text));
    preamble = "";
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    cleanup.forEach((stop) => stop());
    try {
      controller.close();
    } catch {
      // already cancelled
    }
  };
  // A burst of changes is answered with the latest count, not one message each.
  const send = async () => {
    if (reading) {
      again = true;
      return;
    }
    reading = true;
    try {
      do {
        again = false;
        const count = await unreadCount();
        write(
          `event: unread\ndata: ${JSON.stringify({ unreadCount: count })}\n\n`
        );
      } while (again && !finished);
    } catch (err) {
      console.error("Could not read the unread count; ending the stream:", err);
      finish();
    } finally {
      reading = false;
    }
  };

  return new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl;
      cleanup.push(
        onNotificationsChanged((id) => {
          if (id === guestId) void send();
        }),
        onCredentialsChanged((id) => {
          if (id === guestId) finish();
        })
      );
      const heartbeat = setInterval(
        () => write("event: ping\ndata: {}\n\n"),
        HEARTBEAT_MS
      );
      const deadline = setTimeout(finish, MAX_AGE_MS);
      cleanup.push(() => {
        clearInterval(heartbeat);
        clearTimeout(deadline);
        signal.removeEventListener("abort", finish);
      });
      if (signal.aborted) finish();
      else signal.addEventListener("abort", finish);
      void send();
    },
    cancel: finish,
  });
}
