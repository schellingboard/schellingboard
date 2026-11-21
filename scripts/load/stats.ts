export type Sample = { ms: number; status: number };

export type EndpointStats = {
  count: number;
  errors: number;
  rejected: number;
  p50: number;
  p95: number;
  p99: number;
};

/** A request that never got an answer is recorded with status 0. */
export class Recorder {
  private samples = new Map<string, Sample[]>();

  record(endpoint: string, ms: number, status: number) {
    const list = this.samples.get(endpoint) ?? [];
    list.push({ ms, status });
    this.samples.set(endpoint, list);
  }

  summary(): Record<string, EndpointStats> {
    const out: Record<string, EndpointStats> = {};
    for (const [endpoint, list] of [...this.samples].sort()) {
      const times = list.map((s) => s.ms).sort((a, b) => a - b);
      out[endpoint] = {
        count: list.length,
        errors: list.filter((s) => s.status === 0 || s.status >= 500).length,
        rejected: list.filter((s) => s.status >= 400 && s.status < 500).length,
        p50: percentile(times, 50),
        p95: percentile(times, 95),
        p99: percentile(times, 99),
      };
    }
    return out;
  }

  countWhere(status: (code: number) => boolean) {
    let n = 0;
    for (const list of this.samples.values())
      n += list.filter((s) => status(s.status)).length;
    return n;
  }
}

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank))];
}
