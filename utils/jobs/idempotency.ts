import { getRepositories } from "@/db/container";
import { PRUNE_IDEMPOTENCY_KEYS, type Job } from "./job";

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export const pruneIdempotencyKeys: Job = {
  name: PRUNE_IDEMPOTENCY_KEYS,
  run: async (now) => {
    await getRepositories().idempotency.prune(
      new Date(now.getTime() - IDEMPOTENCY_TTL_MS)
    );
    return 0;
  },
};
