// The domain compiles without DOM or Node typings; every runtime has the WHATWG URL.
declare class URL {
  constructor(value: string, base: string);
  readonly origin: string;
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
}

/**
 * Returns a safe same-origin redirect path, or `fallback` if `value` could
 * navigate off-site.
 *
 * Attack vector: the post-login redirect target is attacker-controllable via a
 * crafted link (e.g. `/login?redirect=//evil.com`). Without validation a user
 * who logs in is then bounced to an external site — a phishing aid. Browsers
 * also treat `\` and stripped tabs/newlines as `/`, so `/%5Cevil.com` becomes
 * `//evil.com`, etc.
 *
 * We parse the value with the WHATWG URL parser (the `URL` constructor) against
 * a dummy origin, and accept it only if it stays on that origin and the
 * normalized path is not itself protocol-relative.
 *
 * Best effort only: the browser re-parses the eventual `Location` header with
 * its own WHATWG implementation, which may differ from ours on edge cases, so
 * we cannot guarantee every case is covered.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (!value) {
    return fallback;
  }
  try {
    const url = new URL(value, "http://x");
    if (url.origin !== "http://x" || url.pathname.startsWith("//")) {
      return fallback;
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
