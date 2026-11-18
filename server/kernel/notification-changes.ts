// Imports nothing at run time, like credential-changes: the creators of
// notifications and the stream that tells browsers about them meet here
// without a cycle.

type Listener = (guestId: string) => void;

const g = globalThis as typeof globalThis & {
  __notificationListeners?: Set<Listener>;
};

function listeners(): Set<Listener> {
  g.__notificationListeners ??= new Set();
  return g.__notificationListeners;
}

export function onNotificationsChanged(listener: Listener): () => void {
  listeners().add(listener);
  return () => listeners().delete(listener);
}

/** Call after a guest's notifications are created, read or deleted. */
export function notificationsChanged(guestId: string): void {
  for (const listener of listeners()) {
    try {
      listener(guestId);
    } catch (err) {
      console.error("A notification listener failed:", err);
    }
  }
}
