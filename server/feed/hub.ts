import {
  reaches,
  type RecordedChange,
  type Viewer,
} from "@schellingboard/domain/change";
import { subscribeToChanges } from "@/server/kernel/change-subscribers";

export interface Connection {
  eventId: string;
  viewer: Viewer;
  deliver(change: RecordedChange): void;
}

const g = globalThis as typeof globalThis & {
  __feedConnections?: Set<Connection>;
  __feedSubscription?: () => void;
};

function connections(): Set<Connection> {
  g.__feedConnections ??= new Set();
  return g.__feedConnections;
}

/**
 * Hands each published change to the connections of its event that its
 * audience reaches. Publishing runs under the write lock, so `deliver` sees
 * changes in `seq` order.
 */
export function register(connection: Connection): () => void {
  g.__feedSubscription ??= subscribeToChanges((change) => {
    for (const c of connections()) {
      if (c.eventId === change.eventId && reaches(change.audience, c.viewer)) {
        try {
          c.deliver(change);
        } catch (err) {
          console.error("A feed connection failed; dropping it:", err);
          connections().delete(c);
        }
      }
    }
  });
  connections().add(connection);
  return () => void connections().delete(connection);
}

export function connectionCount(): number {
  return connections().size;
}
