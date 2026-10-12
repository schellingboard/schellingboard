// getRandomValues, not randomUUID: the latter exists only in secure contexts,
// and a self-hosted instance may be served over plain http.
export function newIdempotencyKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
