import { createApiClient } from "@schellingboard/api-client";

export type FakeCall = {
  method: string;
  path: string;
  key: string | null;
  body: unknown;
};

export type FakeHandler = (call: FakeCall) => Response | Promise<Response>;

export const problem = (status: number, code: string) =>
  Response.json(
    { type: "about:blank", title: code, status, code },
    { status, headers: { "content-type": "application/problem+json" } }
  );

export function fakeApi(handler: FakeHandler) {
  const calls: FakeCall[] = [];
  const api = createApiClient({
    baseUrl: "http://api.test",
    fetch: async (request: Request) => {
      const multipart = request.headers
        .get("content-type")
        ?.startsWith("multipart/form-data");
      const text = multipart ? "" : await request.clone().text();
      const call = {
        method: request.method,
        path: new URL(request.url).pathname + new URL(request.url).search,
        key: request.headers.get("idempotency-key"),
        body: multipart
          ? Object.fromEntries(
              [...(await request.clone().formData()).entries()].map(
                ([k, v]) => [
                  k,
                  typeof v === "string" ? v : { file: v.name, type: v.type },
                ]
              )
            )
          : text
            ? (JSON.parse(text) as unknown)
            : undefined,
      };
      calls.push(call);
      return handler(call);
    },
  });
  return { api, calls };
}
