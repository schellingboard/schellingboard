import { useState, type FormEvent } from "react";
import { utcToZonedInput } from "@schellingboard/domain/admin-datetime";
import type { AdminEventCalls, MomentBody } from "../../commands/admin-events";
import type { FieldErrors } from "../../commands/mutation";
import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";
import type {
  AdminEventDay,
  AdminEventMoment,
} from "../../queries/admin-event";
import { Button } from "../../ui/button";
import { CheckboxField, DateTimeField, TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { jumpTo, shown, useJumpWithin } from "./use-section-save";

const FIELDS = ["title", "description", "startTime", "endTime", "dayIds"];

type MomentForm = MomentBody & { description: string };

const dateOf = (iso: string, timezone: string) =>
  utcToZonedInput(iso, timezone).slice(0, 10);
const timeOf = (iso: string, timezone: string) =>
  utcToZonedInput(iso, timezone).slice(11);

function missingOf(form: MomentForm, dayIds?: string[]): FieldErrors {
  const missing: FieldErrors = {};
  if (!form.startTime) missing.startTime = "Start is required";
  if (!form.endTime) missing.endTime = "End is required";
  if (dayIds?.length === 0) missing.dayIds = "Pick at least one day";
  return missing;
}

function MomentFields({
  form,
  onChange,
  errors,
}: {
  form: MomentForm;
  onChange: (patch: Partial<MomentForm>) => void;
  errors: FieldErrors;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <TextField
        label="Title"
        name="title"
        required
        maxLength={100}
        value={form.title}
        onChange={(title) => onChange({ title })}
        error={errors.title}
      />
      <TextField
        label="Details"
        name="description"
        maxLength={200}
        hint="Optional, one line."
        value={form.description}
        onChange={(description) => onChange({ description })}
        error={errors.description}
      />
      <DateTimeField
        label="Start"
        name="startTime"
        kind="time"
        required
        value={form.startTime}
        onChange={(startTime) => onChange({ startTime })}
        error={errors.startTime}
      />
      <DateTimeField
        label="End"
        name="endTime"
        kind="time"
        required
        value={form.endTime}
        onChange={(endTime) => onChange({ endTime })}
        error={errors.endTime}
      />
    </div>
  );
}

function useMomentForm({
  initial,
  dayIds,
  call,
  onChanged,
  onDone,
}: {
  initial: MomentForm;
  dayIds?: string[];
  call: (body: MomentBody, key: string) => Promise<CommandResponse<unknown>>;
  onChanged: () => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [checking, setChecking] = useState(false);
  const missing = missingOf(form, dayIds);
  const mutation = useFormMutation({
    call: (key) => call(form, key),
    fieldNames: FIELDS,
    explainRefusals: true,
  });
  const errors = { ...(checking ? missing : {}), ...mutation.fields };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (Object.keys(missing).length > 0) return;
    const result = await mutation.submit();
    if (result?.ok) {
      onChanged();
      onDone();
    }
  };

  return {
    form,
    errors,
    submit,
    pending: mutation.pending,
    error: shown(mutation.error),
    change: (patch: Partial<MomentForm>) =>
      setForm((prev) => ({ ...prev, ...patch })),
  };
}

function AddMomentForm({
  eventId,
  timezone,
  days,
  calls,
  onChanged,
  onClose,
}: {
  eventId: string;
  timezone: string;
  days: AdminEventDay[];
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [ticked, setTicked] = useState(() => new Set(days.map((d) => d.id)));
  const dayIds = days.filter((d) => ticked.has(d.id)).map((d) => d.id);
  const f = useMomentForm({
    initial: { title: "", description: "", startTime: "", endTime: "" },
    dayIds,
    call: (body, key) => calls.createMoments(eventId, { ...body, dayIds }, key),
    onChanged,
    onDone: onClose,
  });
  const toggle = (id: string, on: boolean) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  return (
    <form
      ref={ref}
      onSubmit={(e) => void f.submit(e)}
      noValidate
      className="space-y-3 rounded-md border border-line-subtle p-4"
    >
      <h3 className="font-medium text-fg">New shared moment</h3>
      <MomentFields form={f.form} onChange={f.change} errors={f.errors} />
      <fieldset className="space-y-2">
        <legend className="font-medium">Days</legend>
        {days.map((d) => (
          <CheckboxField
            key={d.id}
            label={dateOf(d.start, timezone)}
            name="dayIds"
            checked={ticked.has(d.id)}
            onChange={(on) => toggle(d.id, on)}
          />
        ))}
        {f.errors.dayIds && (
          <p role="alert" className="text-sm text-danger-fg">
            {f.errors.dayIds}
          </p>
        )}
      </fieldset>
      <FormErrorSummary fields={f.errors} error={f.error} onJump={jump} />
      <div className="flex gap-2">
        <Button type="submit" disabled={f.pending}>
          {f.pending ? "Adding..." : "Add moment"}
        </Button>
        <Button variant="quiet" disabled={f.pending} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function EditMomentForm({
  moment,
  timezone,
  calls,
  onChanged,
  onClose,
}: {
  moment: AdminEventMoment;
  timezone: string;
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const f = useMomentForm({
    initial: {
      title: moment.title,
      description: moment.description,
      startTime: timeOf(moment.start, timezone),
      endTime: timeOf(moment.end, timezone),
    },
    call: (body, key) => calls.updateMoment(moment.id, body, key),
    onChanged,
    onDone: onClose,
  });
  return (
    <li className="py-3">
      <form
        ref={ref}
        onSubmit={(e) => void f.submit(e)}
        noValidate
        className="space-y-3"
      >
        <MomentFields form={f.form} onChange={f.change} errors={f.errors} />
        <FormErrorSummary fields={f.errors} error={f.error} onJump={jump} />
        <div className="flex gap-2">
          <Button type="submit" disabled={f.pending}>
            {f.pending ? "Saving..." : "Save"}
          </Button>
          <Button variant="quiet" disabled={f.pending} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </li>
  );
}

function DeleteMoment({
  moment,
  label,
  calls,
  onChanged,
  onClose,
}: {
  moment: AdminEventMoment;
  label: string;
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const mutation = useFormMutation({
    call: (key) => calls.deleteMoment(moment.id, key),
    explainRefusals: true,
  });
  const remove = async () => {
    if ((await mutation.submit())?.ok) onChanged();
  };
  return (
    <li className="space-y-2 py-3">
      <p className="text-sm text-danger-fg">Delete {label}?</p>
      <FormErrorSummary fields={{}} error={mutation.error} onJump={jumpTo} />
      <div className="flex gap-2">
        <Button
          variant="danger"
          disabled={mutation.pending}
          onClick={() => void remove()}
        >
          {mutation.pending ? "Deleting..." : "Confirm delete"}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </li>
  );
}

function MomentRow({
  moment,
  date,
  timezone,
  calls,
  onChanged,
}: {
  moment: AdminEventMoment;
  date: string;
  timezone: string;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const close = () => setMode("view");
  const label = `${moment.title} on ${date}`;
  if (mode === "edit")
    return (
      <EditMomentForm
        moment={moment}
        timezone={timezone}
        calls={calls}
        onChanged={onChanged}
        onClose={close}
      />
    );
  if (mode === "delete")
    return (
      <DeleteMoment
        moment={moment}
        label={label}
        calls={calls}
        onChanged={onChanged}
        onClose={close}
      />
    );
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <p className="text-sm text-fg-muted">
        {timeOf(moment.start, timezone)}–{timeOf(moment.end, timezone)}{" "}
        <span className="font-medium text-fg">{moment.title}</span>
        {moment.description && <> · {moment.description}</>}
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="quiet"
          aria-label={`Edit ${label}`}
          onClick={() => setMode("edit")}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          aria-label={`Delete ${label}`}
          onClick={() => setMode("delete")}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}

export function EventMomentsManager({
  eventId,
  timezone,
  days,
  moments,
  calls,
  onChanged,
}: {
  eventId: string;
  timezone: string;
  days: AdminEventDay[];
  moments: AdminEventMoment[];
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <section aria-label="Shared moments" className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">Shared moments</h2>
      <p className="text-sm text-fg-subtle">
        A shared moment, such as lunch or a keynote, shows as a striped band
        across every room. It blocks nothing: sessions can still be booked
        inside it. To make a time unbookable, add a blocker session in every
        room instead. Times are in the event timezone ({timezone}).
      </p>
      {days.map((day) => {
        const own = moments.filter((m) => m.dayId === day.id);
        if (own.length === 0) return null;
        const date = dateOf(day.start, timezone);
        return (
          <div key={day.id}>
            <h3 className="text-sm font-medium text-fg">{date}</h3>
            <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
              {own.map((moment) => (
                <MomentRow
                  key={moment.id}
                  moment={moment}
                  date={date}
                  timezone={timezone}
                  calls={calls}
                  onChanged={onChanged}
                />
              ))}
            </ul>
          </div>
        );
      })}
      {days.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Add a day first; shared moments belong to days.
        </p>
      ) : adding ? (
        <AddMomentForm
          eventId={eventId}
          timezone={timezone}
          days={days}
          calls={calls}
          onChanged={onChanged}
          onClose={() => setAdding(false)}
        />
      ) : (
        <Button onClick={() => setAdding(true)}>Add shared moment</Button>
      )}
    </section>
  );
}
