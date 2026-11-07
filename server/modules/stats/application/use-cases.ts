import type { StatsDeps } from "../ports";
import { eventStatistics, statisticsCsv, statisticsFiles } from "./statistics";

export function createStatsUseCases(deps: StatsDeps) {
  return {
    eventStatistics: eventStatistics(deps),
    statisticsCsv: statisticsCsv(deps),
    statisticsFiles: statisticsFiles(deps),
  };
}

export type StatsUseCases = ReturnType<typeof createStatsUseCases>;
