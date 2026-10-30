import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/proxy";

type ProxyResult =
  { ok: true; request: Request } | { ok: false; response: NextResponse };

/**
 * Drives a request through the real `proxy` middleware and, if it lets the
 * request continue, reconstructs the forwarded request the way Next.js does
 * for `NextResponse.next({ request: { headers } })` (via the
 * `x-middleware-override-headers` / `x-middleware-request-*` response
 * headers).
 */
export async function throughProxy(
  path: string,
  init: RequestInit = {},
  cookies: { name: string; value: string }[] = []
): Promise<ProxyResult> {
  const proxyReq = new NextRequest(
    `http://test${path}`,
    init as ConstructorParameters<typeof NextRequest>[1]
  );
  for (const cookie of cookies) proxyReq.cookies.set(cookie);

  const proxyRes = await proxy(proxyReq);
  if (proxyRes.headers.get("x-middleware-next") !== "1") {
    return { ok: false, response: proxyRes };
  }

  // `x-middleware-override-headers` is the COMPLETE new header set (every key
  // present in the Headers object the middleware passed to
  // `NextResponse.next({ request: { headers } })`), not a diff — Next
  // discards the original request headers and rebuilds only from this list.
  // A header the middleware deleted has no `x-middleware-request-*` entry and
  // is simply absent from the list, so it must not survive here either.
  const overridden = proxyRes.headers.get("x-middleware-override-headers");
  const headers =
    overridden === null
      ? new Headers(proxyReq.headers)
      : new Headers(
          overridden
            .split(",")
            .map((name) => name.trim())
            .filter((name) => name.length > 0)
            .map((name): [string, string] => [
              name,
              proxyRes.headers.get(`x-middleware-request-${name}`) ?? "",
            ])
        );

  // If `init.body` is a ReadableStream that's already been read (e.g. by
  // something upstream), this throws — Request bodies can't be replayed.
  // Not a concern today: no caller passes a stream body, and `proxy()` never
  // reads the request body.
  return {
    ok: true,
    request: new Request(`http://test${path}`, { ...init, headers }),
  };
}
