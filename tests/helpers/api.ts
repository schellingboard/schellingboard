import { NextRequest } from "next/server";
import { DELETE, POST, PUT } from "@/app/api/v1/[[...route]]/route";

export type Problem = {
  code: string;
  detail?: string;
  errors?: { path: string; message: string }[];
};

export type ApiResult = { success: true } | { error: Problem };

export type Fields = Record<string, unknown>;

export type Method = "POST" | "PUT" | "DELETE";

/** One /api/v1 call as a guest holding `cookies`; `success` for any 2xx. */
export async function callApi(
  cookies: Map<string, string>,
  method: Method,
  path: string,
  body?: Fields,
  key?: string
): Promise<ApiResult> {
  const headers: Record<string, string> = {
    cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "),
  };
  if (body) headers["content-type"] = "application/json";
  if (key) headers["idempotency-key"] = key;
  const res = await { POST, PUT, DELETE }[method](
    new NextRequest(`http://test/api/v1${path}`, {
      method,
      headers,
      body: body && JSON.stringify(body),
    })
  );
  if (res.ok) return { success: true };
  return { error: (await res.json()) as Problem };
}
