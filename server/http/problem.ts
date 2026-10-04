import type { AppError, ErrorKind } from "@/server/kernel/result";

const STATUS_BY_KIND: Record<ErrorKind, number> = {
  invalid: 400,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  gone: 410,
};

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
    status: STATUS_BY_KIND[error.kind],
    code: error.code,
    ...(error.detail === undefined ? {} : { detail: error.detail }),
  });
}
