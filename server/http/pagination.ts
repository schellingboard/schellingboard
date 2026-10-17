import type { z } from "zod";
import type { pageQuerySchema } from "@schellingboard/contracts/cursor-page";
import { invalid, ok, type Result } from "@/server/kernel/result";

// Ascending, compared by code units: a newest-first list negates its time.
type SortKey = (string | number)[];

function compare(a: SortKey, b: SortKey): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

const encode = (list: string, key: SortKey) =>
  Buffer.from(JSON.stringify([list, ...key])).toString("base64url");

function decode(
  cursor: string,
  list: string,
  sample: SortKey | undefined
): SortKey | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString());
  } catch {
    return undefined;
  }
  if (!Array.isArray(parsed) || parsed[0] !== list) return undefined;
  const key: unknown[] = parsed.slice(1);
  const fits = sample
    ? key.length === sample.length &&
      key.every((k, i) => typeof k === typeof sample[i])
    : key.length > 0;
  return fits ? (key as SortKey) : undefined;
}

// The cursor holds the last item's sort key rather than a position, so an item
// deleted between two requests shifts nothing.
export function pageOf<T>(
  all: T[],
  { limit, cursor }: z.infer<typeof pageQuerySchema>,
  list: string,
  sortKey: (item: T) => SortKey
): Result<{ items: T[]; nextCursor: string | null }> {
  const keyed = all
    .map((item) => ({ item, key: sortKey(item) }))
    .sort((a, b) => compare(a.key, b.key));
  let rest = keyed;
  if (cursor !== undefined) {
    const after = decode(cursor, list, keyed[0]?.key);
    if (!after)
      return invalid(
        "cursor.invalid",
        "Unknown cursor; start again from the first page"
      );
    rest = keyed.filter((k) => compare(k.key, after) > 0);
  }
  const page = rest.slice(0, limit);
  return ok({
    items: page.map((k) => k.item),
    nextCursor:
      rest.length > limit ? encode(list, page[page.length - 1].key) : null,
  });
}
