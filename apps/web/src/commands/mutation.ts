import { t } from "@lingui/core/macro";
import type { ZodType } from "zod";

import { reasonFor } from "./failure-message";
import { fieldMessage } from "./field-message";
import { problemCode } from "./problem";
import type { CommandResponse } from "./runner";

export type FieldErrors = Record<string, string>;

export type MutationResult<R> =
  | { ok: true; data: R | undefined }
  | {
      ok: false;
      kind: "fields";
      fields: FieldErrors;
      message: string;
      problem: unknown;
    }
  | { ok: false; kind: "conflict"; message: string }
  | { ok: false; kind: "refused"; code: string; message: string }
  | { ok: false; kind: "unreachable"; message: string };

const unreachable = () =>
  t`This might not have been saved. Check that it went through, then try again.`;

export const fixFieldsMessage = () => t`Please fix the highlighted fields.`;

/** What a failed submit says, unless it only points at the highlighted fields. */
export const failureMessage = (
  result: Extract<MutationResult<unknown>, { ok: false }>
) => (result.kind === "fields" ? null : result.message);

const isVersionConflict = (code: string) => code.endsWith(".versionConflict");

/** A form waits for the answer, unlike a command: the user is looking at it. */
export async function awaitMutation<R>(
  call: (key: string) => Promise<CommandResponse<R>>,
  key: string,
  { explainRefusals = false }: { explainRefusals?: boolean } = {}
): Promise<MutationResult<R>> {
  let result: CommandResponse<R>;
  try {
    result = await call(key);
  } catch {
    return { ok: false, kind: "unreachable", message: unreachable() };
  }
  const { response, data, error } = result;
  if (response.ok) return { ok: true, data };
  const detail = (error as { detail?: unknown } | undefined)?.detail;
  if (response.status >= 500) {
    const code = problemCode(error, response.status);
    if (
      explainRefusals &&
      !code.startsWith("http.") &&
      typeof detail === "string" &&
      detail
    )
      return { ok: false, kind: "refused", code, message: detail };
    return { ok: false, kind: "unreachable", message: unreachable() };
  }
  if (isVersionConflict(problemCode(error, response.status)))
    return {
      ok: false,
      kind: "conflict",
      message: t`Someone else changed this while you were editing it.`,
    };
  const problems = (error as { errors?: { path: string; message: string }[] })
    ?.errors;
  if (problems?.length)
    return {
      ok: false,
      kind: "fields",
      fields: Object.fromEntries(
        problems.map((p) => [p.path, fieldMessage(p.message)])
      ),
      message: fixFieldsMessage(),
      problem: error,
    };
  const code = problemCode(error, response.status);
  return {
    ok: false,
    kind: "refused",
    code,
    message:
      reasonFor(code) ??
      (explainRefusals && typeof detail === "string" && detail
        ? detail
        : t`The server refused this. Please try again.`),
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
    fields[path] ??= fieldMessage(issue.message);
  }
  return fields;
}
