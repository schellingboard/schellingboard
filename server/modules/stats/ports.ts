import type { Repositories } from "@/db/container";

export interface StatsDeps {
  repos: Pick<Repositories, "stats">;
  version: () => string;
}
