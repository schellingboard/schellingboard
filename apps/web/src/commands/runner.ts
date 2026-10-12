import type { ApiClient } from "@schellingboard/api-client";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { ReplicaStore } from "../replica/store";

export type CommandResponse<R> = {
  data?: R;
  error?: unknown;
  response: Response;
};

export type Prediction =
  { refusal: string } | { project: (replica: Snapshot) => Snapshot };

export type Command<I, R = undefined> = {
  kind: string;
  predict: (replica: Snapshot, now: Date, input: I) => Prediction;
  /** Commands with the same target are sent one after the other, in click order. */
  target?: (input: I) => string;
  /** `replica` is the one the click was made against, so retries send the same request. */
  call: (
    api: ApiClient,
    input: I,
    key: string,
    replica: Snapshot
  ) => Promise<CommandResponse<R>>;
};

export type Outcome<R> =
  { ok: true; data: R | undefined } | { ok: false; code: string };

export type PendingCommand = {
  key: string;
  kind: string;
  status: "sending" | "acknowledged";
};

type Entry = PendingCommand & {
  guestId: string | undefined;
  project: (replica: Snapshot) => Snapshot;
  clickSeq: number;
  acknowledgedAt?: number;
};

/** The replica can skip the states an answered command settles on, so it expires. */
export const ACKNOWLEDGED_EXPIRY_MS = 3000;
const DEFAULT_RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000];

export function createCommandRunner({
  store,
  api,
  newKey,
  retryDelays = DEFAULT_RETRY_DELAYS,
}: {
  store: ReplicaStore;
  api: ApiClient;
  newKey: () => string;
  retryDelays?: number[];
}) {
  let entries: Entry[] = [];
  let stopped = false;
  const tails = new Map<string, Promise<unknown>>();
  const listeners = new Set<() => void>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let viewCache:
    { base: Snapshot; entries: Entry[]; view: Snapshot } | undefined;

  const notify = () => listeners.forEach((listener) => listener());
  const setEntries = (next: Entry[]) => {
    if (
      next.length === entries.length &&
      next.every((e, i) => e === entries[i])
    )
      return;
    entries = next;
    notify();
  };
  const sweep = () => {
    const replica = store.get();
    const delivered = store.deliveredKeys();
    const now = Date.now();
    setEntries(
      entries.filter(
        (e) =>
          e.guestId === replica.me?.guestId &&
          !delivered.has(e.key) &&
          !(
            e.acknowledgedAt !== undefined &&
            replica.seq !== e.clickSeq &&
            now - e.acknowledgedAt >= ACKNOWLEDGED_EXPIRY_MS
          )
      )
    );
  };
  store.subscribe(() => {
    sweep();
    notify();
  });

  const waiting = new Set<() => void>();
  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer);
        waiting.delete(done);
        resolve();
      };
      const timer = setTimeout(done, ms);
      waiting.add(done);
    });

  const drop = (key: string) =>
    setEntries(entries.filter((e) => e.key !== key));

  async function send<I, R>(
    command: Command<I, R>,
    input: I,
    key: string,
    replica: Snapshot
  ): Promise<Outcome<R> | "gave up"> {
    for (let attempt = 0; ; attempt++) {
      if (stopped) return { ok: false, code: "command.cancelled" };
      let result: CommandResponse<R> | undefined;
      try {
        result = await command.call(api, input, key, replica);
      } catch {
        result = undefined;
      }
      const inProgress =
        (result?.error as { code?: unknown } | undefined)?.code ===
        "idempotency.inProgress";
      if (result && result.response.status < 500 && !inProgress) {
        if (result.response.ok) return { ok: true, data: result.data };
        const code = (result.error as { code?: unknown } | undefined)?.code;
        return {
          ok: false,
          code:
            typeof code === "string" ? code : `http.${result.response.status}`,
        };
      }
      if (attempt >= retryDelays.length) return "gave up";
      await wait(retryDelays[attempt]);
    }
  }

  function view(): Snapshot {
    const base = store.get();
    if (entries.length === 0) return base;
    if (viewCache?.base === base && viewCache.entries === entries)
      return viewCache.view;
    const projected = entries.reduce((replica, e) => e.project(replica), base);
    viewCache = { base, entries, view: projected };
    return projected;
  }

  return {
    async run<I, R>(command: Command<I, R>, input: I): Promise<Outcome<R>> {
      if (stopped) return { ok: false, code: "command.cancelled" };
      const replica = view();
      const prediction = command.predict(
        replica,
        new Date(store.serverNow()),
        input
      );
      if ("refusal" in prediction)
        return { ok: false, code: prediction.refusal };

      const key = newKey();
      const noop = prediction.project(replica) === replica;
      const entry: Entry = {
        key,
        kind: command.kind,
        status: "sending",
        guestId: replica.me?.guestId,
        project: prediction.project,
        clickSeq: replica.seq,
      };
      setEntries([...entries, entry]);

      const target = command.target?.(input);
      const previous = (target && tails.get(target)) || Promise.resolve();
      const turn = previous.then(() => send(command, input, key, replica));
      if (target) {
        const tail = turn.catch(() => undefined);
        tails.set(target, tail);
        void tail.then(() => {
          if (tails.get(target) === tail) tails.delete(target);
        });
      }
      const outcome = await turn;
      if (outcome === "gave up") {
        drop(key);
        return { ok: false, code: "network.unreachable" };
      }
      if (!outcome.ok || noop) {
        drop(key);
        return outcome;
      }
      if (!entries.includes(entry)) return outcome;
      setEntries(
        entries.map((e) =>
          e === entry
            ? { ...entry, status: "acknowledged", acknowledgedAt: Date.now() }
            : e
        )
      );
      const timer = setTimeout(() => {
        timers.delete(timer);
        sweep();
      }, ACKNOWLEDGED_EXPIRY_MS);
      timers.add(timer);
      return outcome;
    },

    /** The replica with every pending prediction applied; the replica itself when none is. */
    view,

    pending: (): PendingCommand[] =>
      entries.map(({ key, kind, status }) => ({ key, kind, status })),

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },

    stop() {
      stopped = true;
      timers.forEach(clearTimeout);
      timers.clear();
      waiting.forEach((done) => done());
      setEntries([]);
    },
  };
}

export type CommandRunner = ReturnType<typeof createCommandRunner>;
