// Real time, not the dev fake clock (ADR 0004): anyone able to set the
// time-override cookie could otherwise jump past a lockout.

export interface BucketLimit {
  capacity: number;
  refillEveryMs: number;
}

type Bucket = { tokens: number; at: number; limit: BucketLimit };

const g = globalThis as typeof globalThis & {
  __rateLimitBuckets?: Map<string, Bucket>;
  __rateLimitWarned?: boolean;
};

export const MAX_BUCKETS = 10_000;

function buckets(): Map<string, Bucket> {
  return (g.__rateLimitBuckets ??= new Map<string, Bucket>());
}

function tokensAt(bucket: Bucket | undefined, limit: BucketLimit, now: number) {
  if (!bucket) return limit.capacity;
  return Math.min(
    limit.capacity,
    bucket.tokens + (now - bucket.at) / limit.refillEveryMs
  );
}

// Full buckets go first, as they are the same as none; then the oldest, down
// to 90 %, so a map of busy buckets is not scanned again on every call.
function prune(now: number) {
  const map = buckets();
  if (map.size < MAX_BUCKETS) return;
  for (const [key, bucket] of map)
    if (tokensAt(bucket, bucket.limit, now) >= bucket.limit.capacity)
      map.delete(key);
  for (const key of map.keys()) {
    if (map.size < MAX_BUCKETS * 0.9) break;
    map.delete(key);
  }
}

function waitSeconds(tokens: number, limit: BucketLimit) {
  return tokens >= 1
    ? 0
    : Math.max(1, Math.ceil(((1 - tokens) * limit.refillEveryMs) / 1000));
}

export function retryAfter(
  key: string,
  limit: BucketLimit,
  now: number = Date.now()
): number {
  return waitSeconds(tokensAt(buckets().get(key), limit, now), limit);
}

export function takeToken(
  key: string,
  limit: BucketLimit,
  now: number = Date.now()
): number {
  const tokens = tokensAt(buckets().get(key), limit, now);
  const wait = waitSeconds(tokens, limit);
  if (wait === 0) {
    prune(now);
    buckets().delete(key);
    buckets().set(key, { tokens: tokens - 1, at: now, limit });
  }
  return wait;
}

export const API_LIMIT: BucketLimit = { capacity: 1000, refillEveryMs: 200 };

// The E2E suite's browsers all come from one address, so they share one
// bucket; its env file raises the burst instead of the code knowing about tests.
export const apiLimit = (): BucketLimit => ({
  ...API_LIMIT,
  capacity: Number(process.env.SB_API_RATE_BURST) || API_LIMIT.capacity,
});

// Sign-in routes cost an email or a password hash per call, so one address gets
// far fewer of them than the general API allows. Like the API limit, the burst
// can be raised by env for the E2E suite, whose browsers share an address.
export const AUTH_API_LIMIT: BucketLimit = {
  capacity: 30,
  refillEveryMs: 6_000,
};
export const authApiLimit = (): BucketLimit => ({
  ...AUTH_API_LIMIT,
  capacity: Number(process.env.SB_AUTH_RATE_BURST) || AUTH_API_LIMIT.capacity,
});

export type LoginScope = "site" | "guest";

// Per scope too, which bounds guesses from rotating IPs at the cost of
// blocking everyone's logins in that scope while an attack is under way.
export const LOGIN_LIMITS = {
  perClient: { capacity: 10, refillEveryMs: 90_000 },
  perScope: { capacity: 100, refillEveryMs: 9_000 },
} as const;

export const TOO_MANY_ATTEMPTS_ERROR =
  "Too many failed attempts — try again in a few minutes";

const clientBucket = (scope: LoginScope, clientKey: string) =>
  `login:${scope}:${clientKey}`;
const scopeBucket = (scope: LoginScope) => `login:${scope}`;

export function loginRetryAfter(
  scope: LoginScope,
  clientKey: string,
  now: number = Date.now()
): number {
  return Math.max(
    retryAfter(clientBucket(scope, clientKey), LOGIN_LIMITS.perClient, now),
    retryAfter(scopeBucket(scope), LOGIN_LIMITS.perScope, now)
  );
}

export function recordLoginFailure(
  scope: LoginScope,
  clientKey: string,
  now: number = Date.now()
): void {
  takeToken(clientBucket(scope, clientKey), LOGIN_LIMITS.perClient, now);
  takeToken(scopeBucket(scope), LOGIN_LIMITS.perScope, now);
}

export const EMAIL_LIMIT: BucketLimit = {
  capacity: 20,
  refillEveryMs: (24 * 60 * 60 * 1000) / 20,
};

export const TOO_MANY_EMAILS_ERROR =
  "Too many codes and links have been emailed to you — try again later";

const emailBucket = (guestId: string) => `email:${guestId}`;

export function isEmailIssuanceBlocked(
  guestId: string,
  now: number = Date.now()
): boolean {
  return retryAfter(emailBucket(guestId), EMAIL_LIMIT, now) > 0;
}

export const emailRetryAfter = (guestId: string, now: number = Date.now()) =>
  retryAfter(emailBucket(guestId), EMAIL_LIMIT, now);

export function recordEmailIssued(
  guestId: string,
  now: number = Date.now()
): void {
  takeToken(emailBucket(guestId), EMAIL_LIMIT, now);
}

export function resetRateLimits(): void {
  delete g.__rateLimitBuckets;
  delete g.__rateLimitWarned;
}

function warnOnce(message: string) {
  if (g.__rateLimitWarned) return;
  g.__rateLimitWarned = true;
  console.warn(message);
}

// X-Forwarded-For is client-supplied up to the entries the trusted proxies
// appended; with N of them, the client's address is the Nth from the end.
export function clientIp(headers: Headers): string {
  const setting = process.env.SB_TRUSTED_PROXIES || "0";
  const trusted = Number(setting);
  if (!Number.isInteger(trusted) || trusted < 0) {
    warnOnce(
      `SB_TRUSTED_PROXIES is "${setting}", not a number of proxies; X-Forwarded-For is ignored, so all visitors share one rate limit.`
    );
    return "unknown";
  }
  if (trusted === 0) {
    if (headers.has("x-forwarded-for"))
      warnOnce(
        "A proxy sent X-Forwarded-For, but SB_TRUSTED_PROXIES is not set, so all visitors share one rate limit. See the configuration docs."
      );
    return "unknown";
  }
  const hops = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  return hops.at(Math.max(0, hops.length - trusted)) ?? "unknown";
}
