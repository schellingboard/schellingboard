export type ErrorKind =
  "notFound" | "forbidden" | "conflict" | "invalid" | "gone";

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
