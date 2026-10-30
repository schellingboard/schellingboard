import { useFormMutation } from "../../commands/use-form-mutation";
import type { MutationResult } from "../../commands/mutation";

/** A sign-in form shows the server's own wording: it says "Wrong password", not "try again". */
export const useCredentialForm = <R>(
  call: Parameters<typeof useFormMutation<R>>[0]["call"]
) => useFormMutation<R>({ call, explainRefusals: true });

/** A token mailed moments ago is still good: that is news, not a failure. */
export const isRecentlySent = (result: MutationResult<unknown> | undefined) =>
  result?.ok === false &&
  result.kind === "refused" &&
  result.code.endsWith("RecentlySent");
