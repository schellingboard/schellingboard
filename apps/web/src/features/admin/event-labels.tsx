import { plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  isLabelColorName,
  LABEL_COLOR_NAMES,
} from "@schellingboard/domain/event-label";
import { type FormEvent, useState } from "react";

import type { AdminLabelCalls, LabelBody } from "../../commands/admin-labels";
import type { FieldErrors } from "../../commands/mutation";
import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminLabel } from "../../queries/admin-labels";
import { Button } from "../../ui/button";
import { SelectField, TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { colorName, LabelBadge } from "../../ui/label-badge";
import { useRowMode } from "./row-mode";
import { jumpTo, shown, useJumpWithin } from "./use-section-save";

function LabelForm({
  initial,
  submitText,
  pendingText,
  call,
  onChanged,
  onClose,
  className,
}: {
  initial: LabelBody;
  submitText: string;
  pendingText: string;
  call: (body: LabelBody, key: string) => Promise<CommandResponse<unknown>>;
  onChanged: () => void;
  onClose: () => void;
  className: string;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [form, setForm] = useState(initial);
  const [checking, setChecking] = useState(false);
  const mutation = useFormMutation({
    call: (key) => call(form, key),
    fieldNames: ["name", "description", "color"],
    explainRefusals: true,
  });
  const missing: FieldErrors = form.name.trim()
    ? {}
    : { name: t`Name is required` };
  const errors = { ...(checking ? missing : {}), ...mutation.fields };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (Object.keys(missing).length > 0) return;
    if ((await mutation.submit())?.ok) {
      onChanged();
      onClose();
    }
  };

  return (
    <form
      ref={ref}
      onSubmit={(e) => void submit(e)}
      noValidate
      className={className}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TextField
          label={t`Name`}
          name="name"
          required
          maxLength={40}
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          error={errors.name}
        />
        <TextField
          label={t`Description`}
          name="description"
          maxLength={200}
          value={form.description ?? ""}
          onChange={(description) => setForm({ ...form, description })}
          error={errors.description}
        />
        <SelectField
          label={t`Colour`}
          name="color"
          value={form.color}
          onChange={(color) =>
            isLabelColorName(color) && setForm({ ...form, color })
          }
          options={LABEL_COLOR_NAMES.map((value) => ({
            value,
            label: colorName(value),
          }))}
          error={errors.color}
        />
      </div>
      <FormErrorSummary fields={errors} error={shown(mutation)} onJump={jump} />
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? pendingText : submitText}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </form>
  );
}

function DeleteLabel({
  label,
  calls,
  onChanged,
  onClose,
}: {
  label: AdminLabel;
  calls: AdminLabelCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const mutation = useFormMutation({
    call: (key) => calls.deleteLabel(label.id, key),
    explainRefusals: true,
  });
  const { name } = label;
  const remove = async () => {
    if ((await mutation.submit())?.ok) onChanged();
  };
  return (
    <li className="space-y-2 py-3">
      <p className="text-sm text-danger-fg">
        <Trans>Delete the label {name}? It is taken off everyone.</Trans>
      </p>
      <FormErrorSummary fields={{}} error={mutation.error} onJump={jumpTo} />
      <div className="flex gap-2">
        <Button
          variant="danger"
          disabled={mutation.pending}
          onClick={() => void remove()}
        >
          {mutation.pending ? t`Deleting...` : t`Confirm delete`}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </li>
  );
}

function LabelRow({
  label,
  calls,
  onChanged,
}: {
  label: AdminLabel;
  calls: AdminLabelCalls;
  onChanged: () => void;
}) {
  const { mode, close, edit, remove } = useRowMode();
  const { name } = label;
  if (mode === "edit")
    return (
      <li className="py-3">
        <LabelForm
          initial={{
            name: label.name,
            description: label.description,
            color: label.color,
          }}
          submitText={t`Save`}
          pendingText={t`Saving...`}
          call={(body, key) => calls.updateLabel(label.id, body, key)}
          onChanged={onChanged}
          onClose={close}
          className="space-y-3"
        />
      </li>
    );
  if (mode === "delete")
    return (
      <DeleteLabel
        label={label}
        calls={calls}
        onChanged={onChanged}
        onClose={close}
      />
    );
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0 space-y-1">
        <p className="flex flex-wrap items-center gap-2">
          <LabelBadge name={label.name} color={label.color} />
          <span className="text-sm text-fg-subtle">
            {plural(label.guestIds.length, {
              one: "# attendee",
              other: "# attendees",
            })}
          </span>
        </p>
        {label.description && (
          <p className="text-sm text-fg-muted">{label.description}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="quiet" aria-label={t`Edit ${name}`} onClick={edit}>
          <Trans>Edit</Trans>
        </Button>
        <Button
          variant="danger"
          aria-label={t`Delete ${name}`}
          onClick={remove}
        >
          <Trans>Delete</Trans>
        </Button>
      </div>
    </li>
  );
}

const NEW_LABEL: LabelBody = {
  name: "",
  description: "",
  color: LABEL_COLOR_NAMES[0],
};

export function EventLabelsManager({
  eventId,
  labels,
  calls,
  onChanged,
}: {
  eventId: string;
  labels: AdminLabel[];
  calls: AdminLabelCalls;
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <section aria-label={t`Labels`} className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">
        <Trans>Labels</Trans>
      </h2>
      <p className="text-sm text-fg-subtle">
        <Trans>
          A label, such as Orga team or Volunteer, marks attendees of this
          event. Give it to people in the guest list above.
        </Trans>
      </p>
      {labels.length > 0 && (
        <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
          {labels.map((label) => (
            <LabelRow
              key={label.id}
              label={label}
              calls={calls}
              onChanged={onChanged}
            />
          ))}
        </ul>
      )}
      {adding ? (
        <LabelForm
          initial={NEW_LABEL}
          submitText={t`Save label`}
          pendingText={t`Adding...`}
          call={(body, key) => calls.createLabel(eventId, body, key)}
          onChanged={onChanged}
          onClose={() => setAdding(false)}
          className="space-y-3 rounded-md border border-line-subtle p-4"
        />
      ) : (
        <Button onClick={() => setAdding(true)}>
          <Trans>Add label</Trans>
        </Button>
      )}
    </section>
  );
}
