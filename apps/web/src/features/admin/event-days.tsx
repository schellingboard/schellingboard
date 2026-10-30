import { useState, type FormEvent } from "react";
import {
  utcToZonedInput,
  zonedInputToInstant,
} from "@schellingboard/domain/admin-datetime";
import { sessionOverlapsWindow } from "@schellingboard/domain/day-window";
import type { AdminEventCalls, DayBody } from "../../commands/admin-events";
import type { FieldErrors } from "../../commands/mutation";
import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminEventDay } from "../../queries/admin-event";
import type { ScheduledSession } from "../../queries/admin-scheduled-sessions";
import { Button } from "../../ui/button";
import { DateTimeField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { jumpTo, shown, useJumpWithin } from "./use-section-save";

const FIELDS = ["start", "end", "startBookings", "endBookings"] as const;
type DayForm = Record<(typeof FIELDS)[number], string>;

const EMPTY: DayForm = {
  start: "",
  end: "",
  startBookings: "",
  endBookings: "",
};

const LABELS: DayForm = {
  start: "Start",
  end: "End",
  startBookings: "Bookings open",
  endBookings: "Bookings close",
};

const formOf = (day: AdminEventDay, timezone: string): DayForm => ({
  start: utcToZonedInput(day.start, timezone),
  end: utcToZonedInput(day.end, timezone),
  startBookings: utcToZonedInput(day.startBookings, timezone),
  endBookings: utcToZonedInput(day.endBookings, timezone),
});

function bodyOf(
  form: DayForm,
  timezone: string
): { body?: DayBody; missing: FieldErrors } {
  const missing: FieldErrors = {};
  const instants = FIELDS.map((k) => {
    const instant = zonedInputToInstant(form[k], timezone);
    if (!instant) missing[k] = `${LABELS[k]} is required`;
    return instant;
  });
  if (instants.some((i) => !i)) return { missing };
  const [start, end, startBookings, endBookings] = instants as string[];
  return { body: { start, end, startBookings, endBookings }, missing };
}

function DayFormFields({
  form,
  onChange,
  errors,
}: {
  form: DayForm;
  onChange: (key: keyof DayForm, value: string) => void;
  errors: FieldErrors;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {FIELDS.map((key) => (
        <DateTimeField
          key={key}
          label={LABELS[key]}
          name={key}
          kind="datetime-local"
          required
          value={form[key]}
          onChange={(v) => onChange(key, v)}
          error={errors[key]}
        />
      ))}
    </div>
  );
}

function useDayForm({
  initial,
  timezone,
  call,
  onChanged,
  onDone,
}: {
  initial: DayForm;
  timezone: string;
  call: (body: DayBody, key: string) => Promise<CommandResponse<unknown>>;
  onChanged: () => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [checking, setChecking] = useState(false);
  const parsed = bodyOf(form, timezone);
  const mutation = useFormMutation({
    call: (key) => call(parsed.body as DayBody, key),
    fieldNames: [...FIELDS],
    explainRefusals: true,
  });
  const errors = { ...(checking ? parsed.missing : {}), ...mutation.fields };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (!parsed.body) return;
    const result = await mutation.submit();
    if (!result) return;
    if (result.ok) {
      onChanged();
      onDone();
    } else if (result.kind === "conflict") onChanged();
  };

  return {
    form,
    errors,
    submit,
    pending: mutation.pending,
    error: shown(mutation.error),
    change: (key: keyof DayForm, value: string) =>
      setForm((prev) => ({ ...prev, [key]: value })),
  };
}

function AddDayForm({
  eventId,
  timezone,
  calls,
  onChanged,
}: {
  eventId: string;
  timezone: string;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!open) return <Button onClick={() => setOpen(true)}>Add day</Button>;
  return (
    <AddDayFields
      eventId={eventId}
      timezone={timezone}
      calls={calls}
      onChanged={onChanged}
      onClose={() => setOpen(false)}
    />
  );
}

function AddDayFields({
  eventId,
  timezone,
  calls,
  onChanged,
  onClose,
}: {
  eventId: string;
  timezone: string;
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const f = useDayForm({
    initial: EMPTY,
    timezone,
    call: (body, key) => calls.createDay(eventId, body, key),
    onChanged,
    onDone: onClose,
  });
  return (
    <form
      ref={ref}
      onSubmit={(e) => void f.submit(e)}
      noValidate
      className="space-y-3 rounded-md border border-line-subtle p-4"
    >
      <h3 className="font-medium text-fg">New day</h3>
      <DayFormFields form={f.form} onChange={f.change} errors={f.errors} />
      <FormErrorSummary fields={f.errors} error={f.error} onJump={jump} />
      <div className="flex gap-2">
        <Button type="submit" disabled={f.pending}>
          {f.pending ? "Adding..." : "Add day"}
        </Button>
        <Button variant="quiet" disabled={f.pending} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function EditDayForm({
  day,
  timezone,
  calls,
  onChanged,
  onClose,
}: {
  day: AdminEventDay;
  timezone: string;
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const [version] = useState(day.version);
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const f = useDayForm({
    initial: formOf(day, timezone),
    timezone,
    call: (body, key) => calls.updateDay(day.id, body, version, key),
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
        <DayFormFields form={f.form} onChange={f.change} errors={f.errors} />
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

function DeleteDay({
  day,
  label,
  affected,
  calls,
  onChanged,
  onClose,
}: {
  day: AdminEventDay;
  label: string;
  affected: string[];
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const mutation = useFormMutation({
    call: (key) => calls.deleteDay(day.id, key),
    explainRefusals: true,
  });
  const remove = async () => {
    if ((await mutation.submit())?.ok) onChanged();
  };
  return (
    <li className="space-y-2 py-3">
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="text-sm text-danger-fg">
        {affected.length === 0
          ? "Delete this day? No scheduled sessions fall within its time window."
          : `Delete this day? The following ${
              affected.length === 1 ? "session" : `${affected.length} sessions`
            } scheduled within its time window will also be deleted:`}
      </p>
      {affected.length > 0 && (
        <ul className="list-inside list-disc text-sm text-danger-fg">
          {affected.map((title, i) => (
            <li key={`${title}-${i}`}>{title}</li>
          ))}
        </ul>
      )}
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

function DayRow({
  day,
  timezone,
  sessions,
  calls,
  onChanged,
}: {
  day: AdminEventDay;
  timezone: string;
  sessions: ScheduledSession[];
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const close = () => setMode("view");
  const label = `${utcToZonedInput(day.start, timezone)} – ${utcToZonedInput(
    day.end,
    timezone
  )} (${timezone})`;

  if (mode === "edit")
    return (
      <EditDayForm
        day={day}
        timezone={timezone}
        calls={calls}
        onChanged={onChanged}
        onClose={close}
      />
    );
  if (mode === "delete") {
    const start = new Date(day.start);
    const end = new Date(day.end);
    const affected = sessions
      .filter((s) =>
        sessionOverlapsWindow(
          { startTime: new Date(s.startTime), endTime: new Date(s.endTime) },
          start,
          end
        )
      )
      .map((s) => s.title);
    return (
      <DeleteDay
        day={day}
        label={label}
        affected={affected}
        calls={calls}
        onChanged={onChanged}
        onClose={close}
      />
    );
  }
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <p className="text-sm text-fg-muted">{label}</p>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="quiet"
          aria-label={`Edit day ${label}`}
          onClick={() => setMode("edit")}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          aria-label={`Delete day ${label}`}
          onClick={() => setMode("delete")}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}

export function EventDaysManager({
  eventId,
  timezone,
  days,
  sessions,
  calls,
  onChanged,
}: {
  eventId: string;
  timezone: string;
  days: AdminEventDay[];
  sessions: ScheduledSession[];
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  return (
    <section aria-label="Days" className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">Days</h2>
      <p className="text-sm text-fg-subtle">
        The event&apos;s dates are the days you add here. All times are in the
        event timezone ({timezone}).
      </p>
      {days.length > 0 && (
        <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
          {days.map((day) => (
            <DayRow
              key={day.id}
              day={day}
              timezone={timezone}
              sessions={sessions}
              calls={calls}
              onChanged={onChanged}
            />
          ))}
        </ul>
      )}
      <AddDayForm
        eventId={eventId}
        timezone={timezone}
        calls={calls}
        onChanged={onChanged}
      />
    </section>
  );
}
