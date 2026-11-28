import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { ApiClient } from "@schellingboard/api-client";
import { type FormEvent, useState } from "react";

import { confirmNameCall } from "../commands/confirm-name";
import { useFormMutation } from "../commands/use-form-mutation";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { FormErrorSummary } from "../ui/form-error-summary";
import { NameField } from "../ui/name-field";

/** The first visit of a person a proxy made: the name from the email is theirs to confirm. */
export function NameConfirmDialog({
  api,
  names,
  initial,
  onConfirmed,
}: {
  api: ApiClient;
  names: string[];
  initial: string;
  onConfirmed: () => void;
}) {
  const [name, setName] = useState(initial);
  const mutation = useFormMutation({
    call: (key) => confirmNameCall(api)(name, key),
    fieldNames: ["name"],
  });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if ((await mutation.submit())?.ok) onConfirmed();
  };
  return (
    <Dialog open required onClose={() => undefined} title={t`Your name`}>
      <form noValidate onSubmit={(e) => void submit(e)} className="space-y-4">
        <p className="text-sm text-fg-subtle">
          <Trans>
            This is how other people see you. Change it if it is not right.
          </Trans>
        </p>
        <NameField
          name="name"
          required
          autoFocus
          value={name}
          onChange={setName}
          others={names}
          error={mutation.fields.name}
        />
        <FormErrorSummary
          fields={mutation.fields}
          error={mutation.fixFields ? null : mutation.error}
          onJump={(field) => document.getElementsByName(field)[0]?.focus()}
        />
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? t`Saving...` : t`Save`}
        </Button>
      </form>
    </Dialog>
  );
}
