/** A TLS-ending proxy talks plain http to us; without this the Origin check
 * refuses every browser request. */
export function withForwardedProto(req: Request): Request {
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (proto !== "http" && proto !== "https") return req;
  const url = new URL(req.url);
  if (url.protocol === `${proto}:`) return req;
  url.protocol = proto;
  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    signal: req.signal,
    duplex: "half",
  } as RequestInit);
}
