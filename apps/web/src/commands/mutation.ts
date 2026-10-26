import type { ZodType } from "zod";
import { reasonFor } from "./failure-message";
import { problemCode } from "./problem";
import type { CommandResponse } from "./runner";

export type FieldErrors = Record<string, string>;

export type MutationResult<R> =
  | { ok: true; data: R | undefined }
  | { ok: false; kind: "fields"; fields: FieldErrors; message: string }
  | { ok: false; kind: "conflict"; message: string }
  | { ok: false; kind: "refused"; code: string; message: string }
  | { ok: false; kind: "unreachable"; message: string };

const UNREACHABLE =
  "This might not have been saved. Check that it went through, then try again.";

export const FIX_FIELDS_MESSAGE = "Please fix the highlighted fields.";

const isVersionConflict = (code: string) => code.endsWith(".versionConflict");

/** A form waits for the answer, unlike a command: the user is looking at it. */
export async function awaitMutation<R>(
  call: (key: string) => Promise<CommandResponse<R>>,
  key: string
): Promise<MutationResult<R>> {
  let result: CommandResponse<R>;
  try {
    result = await call(key);
  } catch {
    return { ok: false, kind: "unreachable", message: UNREACHABLE };
  }
  const { response, data, error } = result;
  if (response.ok) return { ok: true, data };
  if (response.status >= 500)
    return { ok: false, kind: "unreachable", message: UNREACHABLE };
  if (isVersionConflict(problemCode(error, response.status)))
    return {
      ok: false,
      kind: "conflict",
      message: "Someone else changed this while you were editing it.",
    };
  const problems = (error as { errors?: { path: string; message: string }[] })
    ?.errors;
  if (problems?.length)
    return {
      ok: false,
      kind: "fields",
      fields: Object.fromEntries(problems.map((p) => [p.path, p.message])),
      message: FIX_FIELDS_MESSAGE,
    };
  const code = problemCode(error, response.status);
  return {
    ok: false,
    kind: "refused",
    code,
    message: reasonFor(code) ?? "The server refused this. Please try again.",
  };
}

export function validateFields(
  schema: ZodType,
  values: unknown
): FieldErrors | undefined {
  const parsed = schema.safeParse(values);
  if (parsed.success) return undefined;
  const fields: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path.join(".");
    fields[path] ??= issue.message;
  }
  return fields;
}
