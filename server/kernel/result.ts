export type ErrorKind =
  "notFound" | "forbidden" | "conflict" | "invalid" | "gone" | "unavailable";

// The API and the legacy routes answer a kind with the same status.
export const HTTP_STATUS_BY_KIND = {
  invalid: 400,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  gone: 410,
  unavailable: 503,
} as const satisfies Record<ErrorKind, number>;

export interface FieldError {
  path: string;
  message: string;
}

export interface AppError {
  kind: ErrorKind;
  code: string;
  detail?: string;
  errors?: FieldError[];
  /** The subject as it is now, sent with a version conflict. */
  current?: unknown;
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
export const unavailable = failing("unavailable");

export function invalidFields(code: string, errors: FieldError[]): Failure {
  return {
    ok: false,
    error: { kind: "invalid", code, detail: errors[0]?.message, errors },
  };
}

export function versionConflict(
  subject: string,
  current: unknown,
  detail: string
): Failure {
  return {
    ok: false,
    error: {
      kind: "conflict",
      code: `${subject}.versionConflict`,
      detail,
      current,
    },
  };
}
