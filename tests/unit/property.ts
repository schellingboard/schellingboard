import type fc from "fast-check";

// Random on every run; a failure prints the seed and counterexample, and
// FC_SEED replays it.
const seed = Number.parseInt(process.env.FC_SEED ?? "", 10);

export const RUNS: fc.Parameters<unknown> = {
  numRuns: 200,
  ...(Number.isNaN(seed) ? {} : { seed }),
};
