import { web } from "@/server/http/web";

/** A request through the whole web app, gates included, as a browser would send it. */
export function throughWeb(
  path: string,
  init: RequestInit = {},
  cookies: { name: string; value: string }[] = []
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (cookies.length > 0)
    headers.set(
      "cookie",
      cookies.map((c) => `${c.name}=${c.value}`).join("; ")
    );
  return Promise.resolve(
    web.fetch(new Request(`http://test${path}`, { ...init, headers }))
  );
}
