// Imports nothing at run time, like change-subscribers: the feed hub listens
// from a module the actions and use cases reach without a cycle.

type Listener = (guestId: string) => void;

const g = globalThis as typeof globalThis & {
  __credentialListeners?: Set<Listener>;
};

function listeners(): Set<Listener> {
  g.__credentialListeners ??= new Set();
  return g.__credentialListeners;
}

export function onCredentialsChanged(listener: Listener): () => void {
  listeners().add(listener);
  return () => listeners().delete(listener);
}

/** Call after a guest's protection or password changes, or the guest is deleted. */
export function credentialsChanged(guestId: string): void {
  for (const listener of listeners()) {
    try {
      listener(guestId);
    } catch (err) {
      console.error("A credential listener failed:", err);
    }
  }
}
