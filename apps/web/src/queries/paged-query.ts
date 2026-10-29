import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type PagedState<Key extends string, Item> =
  | { status: "loading" }
  | { status: "error"; code: string }
  | ({ status: "ready" } & Record<Key, Item[]>);

type Page<Raw> = {
  data?: { items: Raw[]; nextCursor?: string | null };
  error?: unknown;
  response: { status: number };
};

/** A query over every page of a list; `load` again after a change. */
export function createPagedQuery<Key extends string, Raw, Item>({
  key,
  fetchPage,
  map,
}: {
  key: Key;
  fetchPage: (cursor: string | undefined) => Promise<Page<Raw>>;
  map: (raw: Raw) => Item;
}) {
  const state = createObservable<PagedState<Key, Item>>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const items: Item[] = [];
        let cursor: string | undefined;
        do {
          const { data, error, response } = await fetchPage(cursor);
          if (mine !== latest) return;
          if (!data) {
            state.set({
              status: "error",
              code: problemCode(error, response.status),
            });
            return;
          }
          items.push(...data.items.map(map));
          cursor = data.nextCursor ?? undefined;
        } while (cursor);
        state.set({ status: "ready", [key]: items });
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
