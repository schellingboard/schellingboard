import { useEffect, useRef, useState } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import {
  snapshotSchema,
  type Snapshot,
} from "@schellingboard/contracts/snapshot";
import { createCommandRunner, type CommandRunner } from "../commands/runner";
import type { ReplicaPersistence } from "../replica/persistence";
import { startReplicaSession } from "../replica/session";
import type { ReplicaStore } from "../replica/store";
import { newKey } from "./keys";

export type ScheduleSession =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "failed"; retry: () => void }
  | { status: "ready"; store: ReplicaStore; runner: CommandRunner };

class EventNotFound extends Error {}

/**
 * The replica, feed and command runner of one event for the viewer the server
 * says the browser is. A different viewer gets a new session: the feed is
 * closed and the replica, runner and everything read from them are reopened.
 */
export function useScheduleSession({
  api,
  slug,
  viewer,
  persistence,
  createSource = (url) => new EventSource(url),
}: {
  api: ApiClient;
  slug: string;
  /** Undefined until the server has said who the browser acts as. */
  viewer: string | null | undefined;
  persistence: Pick<ReplicaPersistence, "load" | "discardOthers" | "save">;
  createSource?: (url: string) => EventSource;
}): ScheduleSession {
  const [state, setState] = useState<{
    key: string;
    session: ScheduleSession;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Read when a session starts, not a reason to start another.
  const latest = useRef({ persistence, createSource });
  useEffect(() => {
    latest.current = { persistence, createSource };
  });
  const key = `${slug}\u0000${viewer ?? "-"}\u0000${attempt}`;

  useEffect(() => {
    if (viewer === undefined) return;
    let cancelled = false;
    let stop: (() => void) | undefined;
    const loadSnapshot = async (): Promise<Snapshot> => {
      const { data, response } = await api.GET(
        "/api/v1/events/{slug}/snapshot",
        {
          params: { path: { slug } },
        }
      );
      if (response.status === 404) throw new EventNotFound();
      if (!data) throw new Error(`snapshot ${response.status}`);
      return snapshotSchema.parse(data);
    };
    startReplicaSession({
      slug,
      viewer,
      persistence: latest.current.persistence,
      loadSnapshot,
      createSource: latest.current.createSource,
    }).then(
      (opened) => {
        if (cancelled) {
          opened.stop();
          return;
        }
        const runner = createCommandRunner({
          store: opened.store,
          api,
          newKey,
        });
        stop = () => {
          runner.stop();
          opened.stop();
        };
        setState({
          key,
          session: { status: "ready", store: opened.store, runner },
        });
      },
      (error: unknown) => {
        if (cancelled) return;
        setState({
          key,
          session:
            error instanceof EventNotFound
              ? { status: "missing" }
              : {
                  status: "failed",
                  retry: () => setAttempt((n) => n + 1),
                },
        });
      }
    );
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [api, slug, viewer, key]);

  return state?.key === key ? state.session : { status: "loading" };
}
