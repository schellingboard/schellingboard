import type { Repositories } from "@/db/container";
import type { Actor } from "./actor";
import { withCommandKey } from "./command-key";

type Store = Repositories["idempotency"];
type IdempotentRequest = Parameters<Store["claim"]>[0];
type StoredResponse = Parameters<Store["complete"]>[1];

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

// A request still unfinished after this is taken to have died with its process,
// so a retry runs again instead of getting 409 until the row expires.
const ABANDONED_AFTER_MS = 60 * 1000;

export type IdempotentOutcome<T> =
  | { state: "keyReused" }
  | { state: "inProgress" }
  | { state: "replayed"; response: StoredResponse }
  | { state: "ran"; value: T };

// ADR 0012 section 5. `run` returns the response to keep under the key, or
// null to forget the key (a failure the client should retry as new). The
// changes `run` records carry the key as their `command_key`.
export async function runIdempotent<T>(
  repo: Store,
  request: IdempotentRequest,
  now: Date,
  run: () => Promise<{ value: T; response: StoredResponse | null }>
): Promise<IdempotentOutcome<T>> {
  const claim = await repo.claim(request, now, {
    expiredBefore: new Date(now.getTime() - IDEMPOTENCY_TTL_MS),
    abandonedBefore: new Date(now.getTime() - ABANDONED_AFTER_MS),
  });
  if (claim.state === "keyReused" || claim.state === "inProgress") {
    return { state: claim.state };
  }
  if (claim.state === "done") {
    return { state: "replayed", response: claim.response };
  }

  const owner = { actor: request.actor, key: request.key, claimedAt: now };
  let outcome: { value: T; response: StoredResponse | null };
  try {
    outcome = await withCommandKey(request.key, run);
  } catch (error) {
    await repo.release(owner);
    throw error;
  }
  if (outcome.response) await repo.complete(owner, outcome.response);
  else await repo.release(owner);
  return { state: "ran", value: outcome.value };
}

export const MAX_KEY_LENGTH = 255;

// Requests with neither admin nor guest have no one to scope a key to, so for
// them the key is ignored rather than shared by every anonymous client.
export function actorScope({ admin, guest }: Actor): string | null {
  if (!admin && !guest) return null;
  return `${admin ? "admin" : "-"}:${guest ? `${guest.level}:${guest.id}` : "-"}`;
}
