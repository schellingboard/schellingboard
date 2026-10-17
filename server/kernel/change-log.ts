import type { Repositories } from "@/db/container";

export function newestSeq(q: Pick<Repositories, "changes">): Promise<number> {
  return q.changes.getNewestSeq();
}
