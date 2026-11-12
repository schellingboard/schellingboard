export type Options = {
  users: number;
  durationMs: number;
  /** Fail on a threshold breach, and verify the RSVP counts afterwards. */
  check: boolean;
  build: boolean;
  report?: string;
};

// The seed names 30 first by 34 last names, less the 40 curated guests.
const MAX_USERS = 980;

const UNIT_MS = { s: 1000, m: 60_000, h: 3_600_000 } as const;

/** "90", "45s", "15m" or "2h"; a bare number is seconds. */
export function parseDuration(text: string): number {
  const match = /^(\d+)([smh]?)$/.exec(text);
  const ms = match
    ? Number(match[1]) * UNIT_MS[(match[2] || "s") as keyof typeof UNIT_MS]
    : 0;
  if (ms <= 0) throw new Error(`Invalid duration "${text}" (use 90, 45s, 15m)`);
  return ms;
}

export function parseOptions(argv: string[]): Options {
  const options: Options = {
    users: 1000,
    durationMs: 15 * 60_000,
    check: false,
    build: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split("=", 2);
    const value = () => inline ?? argv[++i] ?? "";
    switch (flag) {
      case "--users": {
        const users = Number(value());
        if (!Number.isInteger(users) || users < 1 || users > MAX_USERS)
          throw new Error(`Invalid --users: a whole number up to ${MAX_USERS}`);
        options.users = users;
        break;
      }
      case "--duration":
        options.durationMs = parseDuration(value());
        break;
      case "--report":
        options.report = value();
        break;
      case "--check":
        options.check = true;
        break;
      case "--no-build":
        options.build = false;
        break;
      default:
        throw new Error(`Unknown option ${flag}`);
    }
  }
  return options;
}

export function pickWeighted<K extends string>(
  weights: Record<K, number>,
  roll: number
): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let left = roll * total;
  for (const [key, weight] of entries) {
    if (left < weight) return key;
    left -= weight;
  }
  return entries[entries.length - 1][0];
}
