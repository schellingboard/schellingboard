export const READ_TIMEOUT_MS = 20_000;

// A request that is never answered (a dead Wi-Fi, a captive portal) neither
// fails nor retries, which leaves a screen on "Loading…". Only reads are cut
// off: a write that timed out may still have gone through.
export function fetchWithTimeout(request: Request): Promise<Response> {
  if (
    (request.method !== "GET" && request.method !== "HEAD") ||
    typeof AbortSignal.any !== "function"
  )
    return fetch(request);
  return fetch(
    new Request(request, {
      signal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(READ_TIMEOUT_MS),
      ]),
    })
  );
}
