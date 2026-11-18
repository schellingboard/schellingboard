export const retryDelayMs = (failures: number) =>
  Math.min(2_000 * 2 ** Math.max(0, failures - 1), 30_000);
