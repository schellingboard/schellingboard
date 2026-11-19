import { getRepositories } from "@/db/container";

import { type Job, PRUNE_LOGIN_SESSIONS } from "./job";

export const pruneLoginSessions: Job = {
  name: PRUNE_LOGIN_SESSIONS,
  run: async (now) => {
    await getRepositories().loginSessions.deleteExpired(now);
    return 0;
  },
};
