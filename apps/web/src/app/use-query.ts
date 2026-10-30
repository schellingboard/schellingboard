import { useEffect, useState, useSyncExternalStore } from "react";

type Query<S> = {
  get: () => S;
  subscribe: (listener: () => void) => () => void;
  load: () => Promise<void>;
};

/** A query created once, loaded on mount, and its state. */
export function useQuery<S>(create: () => Query<S>): [S, () => void] {
  const [query] = useState(create);
  useEffect(() => {
    void query.load();
  }, [query]);
  const state = useSyncExternalStore(query.subscribe, query.get);
  return [state, () => void query.load()];
}

type Loadable = { status: "loading" | "error" | "ready" };

/** One status for a page that needs several queries: the first to fail, else the first still loading. */
export function jointStatus(...states: Loadable[]): Loadable["status"] {
  if (states.some((s) => s.status === "error")) return "error";
  return states.every((s) => s.status === "ready") ? "ready" : "loading";
}
