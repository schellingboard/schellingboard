import type { TypedResponse } from "hono";
import {
  problemSchema,
  versionConflictSchema,
} from "@schellingboard/contracts/problem";
import type { z } from "zod";
import {
  HTTP_STATUS_BY_KIND,
  type AppError,
  type ErrorKind,
} from "@/server/kernel/result";

const TITLES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  410: "Gone",
  422: "Unprocessable Content",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

export interface Problem {
  status: number;
  code: string;
  detail?: string;
  errors?: { path: string; message: string }[];
  current?: unknown;
}

// RFC 9457. Clients branch on `code`, never on `title` or `detail`.
export function problemResponse({ status, ...rest }: Problem): Response {
  const body = {
    type: "about:blank",
    title: TITLES[status] ?? "Error",
    status,
    ...rest,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/problem+json",
      "cache-control": "no-store",
    },
  });
}

// `present` turns a conflict's current state into the route's view of it;
// without one, the domain object stays out of the response.
export function problemFromError(
  error: AppError,
  present?: (current: never) => unknown
): Response {
  return problemResponse({
    status: HTTP_STATUS_BY_KIND[error.kind],
    code: error.code,
    ...(error.detail === undefined ? {} : { detail: error.detail }),
    ...(error.errors === undefined ? {} : { errors: error.errors }),
    ...(error.current === undefined || !present
      ? {}
      : { current: present(error.current as never) }),
  });
}

type ProblemStatus = (typeof HTTP_STATUS_BY_KIND)[ErrorKind];

// For a route's handler: the route declares problems as its `default` response.
export function problem(
  error: AppError,
  present?: (current: never) => unknown
): Response &
  {
    [S in ProblemStatus]: TypedResponse<
      z.infer<typeof problemSchema>,
      S,
      "json"
    >;
  }[ProblemStatus] {
  return problemFromError(error, present) as never;
}

export const problemDefault = {
  default: {
    description: "Problem details (RFC 9457); clients branch on `code`",
    content: { "application/problem+json": { schema: problemSchema } },
  },
} as const;

export const versionConflictResponse = <T extends z.ZodType>(current: T) => ({
  409: {
    description:
      "A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion`",
    content: {
      "application/problem+json": { schema: versionConflictSchema(current) },
    },
  },
});
