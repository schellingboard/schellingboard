import { getRepositories } from "@/db/container";
import { PRUNE_LOGIN_SESSIONS, type Job } from "./job";

export const pruneLoginSessions: Job = {
  name: PRUNE_LOGIN_SESSIONS,
  run: async (now) => {
    await getRepositories().loginSessions.deleteExpired(now);
    return 0;
  },
};
