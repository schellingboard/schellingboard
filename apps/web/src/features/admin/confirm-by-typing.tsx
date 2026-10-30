import { useState, type ReactNode } from "react";
import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";
import { Button } from "../../ui/button";
import { TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { shown } from "./use-section-save";

/** A delete that stays disabled until the admin types the subject's name. */
export function ConfirmByTyping<R>({
  label,
  expected,
  warning,
  heading,
  call,
  onDeleted,
  onCancel,
}: {
  label: string;
  expected: string;
  warning: ReactNode;
  heading?: string;
  call: (key: string) => Promise<CommandResponse<R>>;
  onDeleted: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const mutation = useFormMutation({ call, explainRefusals: true });
  const remove = async () => {
    if ((await mutation.submit())?.ok) onDeleted();
  };

  return (
    <div className="space-y-2">
      {heading && <p className="font-medium text-fg">{heading}</p>}
      <p className="text-sm text-danger-fg">{warning}</p>
      <TextField
        label={label}
        value={typed}
        onChange={setTyped}
        placeholder={expected}
      />
      <FormErrorSummary
        fields={{}}
        error={shown(mutation.error)}
        onJump={() => {}}
      />
      <div className="flex gap-2">
        <Button
          variant="danger"
          disabled={mutation.pending || typed !== expected}
          onClick={() => void remove()}
        >
          {mutation.pending ? "Deleting..." : "Confirm delete"}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
