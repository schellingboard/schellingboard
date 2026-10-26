import { NextRequest } from "next/server";
import { DELETE, POST, PUT } from "@/app/api/v1/[[...route]]/route";
import { GUEST_COOKIE_NAME, openGuestValue } from "./guest-cookie";

export type Problem = {
  code: string;
  detail?: string;
  errors?: { path: string; message: string }[];
};

export type ProposalResult = { success: true } | { error: Problem };

type Fields = Record<string, unknown>;

export function apiRequest(
  method: string,
  path: string,
  { body, cookie }: { body?: unknown; cookie?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return new NextRequest(`http://test/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const asGuest = (id: string) =>
  `${GUEST_COOKIE_NAME}=${openGuestValue(id)}`;

/** The proposal routes of /api/v1 as a guest holding `cookies` calls them. */
export function proposalApi(cookies: Map<string, string>) {
  async function call(
    method: string,
    path: string,
    body?: Fields,
    key?: string
  ): Promise<ProposalResult> {
    const headers: Record<string, string> = {
      cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "),
    };
    if (body) headers["content-type"] = "application/json";
    if (key) headers["idempotency-key"] = key;
    const handle = { POST, PUT, DELETE }[method as "POST" | "PUT" | "DELETE"];
    const res = await handle(
      new NextRequest(`http://test/api/v1${path}`, {
        method,
        headers,
        body: body && JSON.stringify(body),
      })
    );
    if (res.ok) return { success: true };
    return { error: (await res.json()) as Problem };
  }

  return {
    createProposal: (fields: Fields, key?: string) =>
      call("POST", "/proposals", fields, key),
    updateProposal: (id: string, fields: Fields) =>
      call("PUT", `/proposals/${id}`, fields),
    joinProposal: (id: string) => call("POST", `/proposals/${id}/hosts`),
    deleteProposal: (id: string) => call("DELETE", `/proposals/${id}`),
    createProposalComment: (
      { proposalId, ...fields }: Fields & { proposalId: string },
      key?: string
    ) => call("POST", `/proposals/${proposalId}/comments`, fields, key),
  };
}

export function errorFields(result: ProposalResult): string[] {
  if (!("error" in result) || !result.error.errors)
    throw new Error(`not field issues: ${JSON.stringify(result)}`);
  return result.error.errors.map((e) => e.path);
}
