import { getRepositories } from "@/db/container";
import { IDEMPOTENCY_TTL_MS } from "@/server/kernel/idempotency";

import { type Job, PRUNE_IDEMPOTENCY_KEYS } from "./job";

export const pruneIdempotencyKeys: Job = {
  name: PRUNE_IDEMPOTENCY_KEYS,
  run: async (now) => {
    await getRepositories().idempotency.prune(
      new Date(now.getTime() - IDEMPOTENCY_TTL_MS)
    );
    return 0;
  },
};
