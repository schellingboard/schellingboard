export type ErrorKind =
  "notFound" | "forbidden" | "conflict" | "invalid" | "gone";

// The API and the legacy routes answer a kind with the same status.
export const HTTP_STATUS_BY_KIND = {
  invalid: 400,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  gone: 410,
} as const satisfies Record<ErrorKind, number>;

export interface AppError {
  kind: ErrorKind;
  code: string;
  detail?: string;
}

export type Failure = { ok: false; error: AppError };
export type Result<T> = { ok: true; value: T } | Failure;

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function failing(kind: ErrorKind) {
  return (code: string, detail?: string): Failure => ({
    ok: false,
    error: detail === undefined ? { kind, code } : { kind, code, detail },
  });
}

export const notFound = failing("notFound");
export const forbidden = failing("forbidden");
export const conflict = failing("conflict");
export const invalid = failing("invalid");
export const gone = failing("gone");
