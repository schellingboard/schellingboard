import type { RecordedChange } from "@schellingboard/domain/change";

// Imports nothing at run time: the jobs loop subscribes from a module Next
// also bundles for the Edge runtime, where db/container cannot load.

type Subscriber = (change: RecordedChange) => void;

const g = globalThis as typeof globalThis & {
  __changeSubscribers?: Set<Subscriber>;
};

function subscribers(): Set<Subscriber> {
  g.__changeSubscribers ??= new Set();
  return g.__changeSubscribers;
}

export function subscribeToChanges(subscriber: Subscriber): () => void {
  subscribers().add(subscriber);
  return () => subscribers().delete(subscriber);
}

export function publish(recorded: RecordedChange[]): void {
  for (const change of recorded) {
    for (const subscriber of subscribers()) {
      try {
        subscriber(change);
      } catch (err) {
        console.error("A change subscriber failed:", err);
      }
    }
  }
}
