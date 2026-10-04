import type { TypedResponse } from "hono";
import { problemSchema } from "@schellingboard/contracts/problem";
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
};

export interface Problem {
  status: number;
  code: string;
  detail?: string;
  errors?: { path: string; message: string }[];
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

export function problemFromError(error: AppError): Response {
  return problemResponse({
    status: HTTP_STATUS_BY_KIND[error.kind],
    code: error.code,
    ...(error.detail === undefined ? {} : { detail: error.detail }),
    ...(error.errors === undefined ? {} : { errors: error.errors }),
  });
}

type ProblemStatus = (typeof HTTP_STATUS_BY_KIND)[ErrorKind];

// For a route's handler: the route declares problems as its `default` response.
export function problem(
  error: AppError
): Response &
  TypedResponse<z.infer<typeof problemSchema>, ProblemStatus, "json"> {
  return problemFromError(error) as never;
}

export const problemDefault = {
  default: {
    description: "Problem details (RFC 9457); clients branch on `code`",
    content: { "application/problem+json": { schema: problemSchema } },
  },
} as const;
