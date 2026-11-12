import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  utcToZonedInput,
  zonedInputToInstant,
} from "@schellingboard/domain/admin-datetime";
import { sessionOverlapsWindow } from "@schellingboard/domain/day-window";
import { type FormEvent, useRef, useState } from "react";

import type { AdminEventCalls, DayBody } from "../../commands/admin-events";
import type { FieldErrors } from "../../commands/mutation";
import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";
import type {
  AdminEventDay,
  AdminEventMoment,
} from "../../queries/admin-event";
import type { ScheduledSession } from "../../queries/admin-sessions";
import { Button } from "../../ui/button";
import { DateTimeField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { useRowMode } from "./row-mode";
import { jumpTo, shown, useJumpWithin } from "./use-section-save";

const FIELDS = ["start", "end", "startBookings", "endBookings"] as const;
type DayForm = Record<(typeof FIELDS)[number], string>;

const EMPTY: DayForm = {
  start: "",
  end: "",
  startBookings: "",
  endBookings: "",
};

const LABELS: Record<keyof DayForm, MessageDescriptor> = {
  start: msg({ message: "Start", context: "Date field: when it begins" }),
  end: msg({ message: "End", context: "Date field: when it ends" }),
  startBookings: msg`Bookings open`,
  endBookings: msg`Bookings close`,
};

const REQUIRED: Record<keyof DayForm, MessageDescriptor> = {
  start: msg`Start is required`,
  end: msg`End is required`,
  startBookings: msg`Bookings open is required`,
  endBookings: msg`Bookings close is required`,
};

const FOLLOWERS: Partial<Record<keyof DayForm, keyof DayForm>> = {
  start: "startBookings",
  end: "endBookings",
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
    if (!instant) missing[k] = i18n._(REQUIRED[k]);
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
          label={i18n._(LABELS[key])}
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
  followDay = false,
}: {
  initial: DayForm;
  timezone: string;
  call: (body: DayBody, key: string) => Promise<CommandResponse<unknown>>;
  onChanged: () => void;
  onDone: () => void;
  followDay?: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [checking, setChecking] = useState(false);
  const edited = useRef(new Set<keyof DayForm>());
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
    change: (key: keyof DayForm, value: string) => {
      const follower = FOLLOWERS[key];
      if (Object.values(FOLLOWERS).includes(key)) edited.current.add(key);
      setForm((prev) => ({
        ...prev,
        [key]: value,
        ...(followDay && follower && !edited.current.has(follower)
          ? { [follower]: value }
          : {}),
      }));
    },
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
  if (!open)
    return (
      <Button onClick={() => setOpen(true)}>
        <Trans>Add day</Trans>
      </Button>
    );
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
    followDay: true,
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
      <h3 className="font-medium text-fg">
        <Trans>New day</Trans>
      </h3>
      <DayFormFields form={f.form} onChange={f.change} errors={f.errors} />
      <FormErrorSummary fields={f.errors} error={f.error} onJump={jump} />
      <div className="flex gap-2">
        <Button type="submit" disabled={f.pending}>
          {f.pending ? t`Adding...` : t`Add day`}
        </Button>
        <Button variant="quiet" disabled={f.pending} onClick={onClose}>
          <Trans>Cancel</Trans>
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
            {f.pending ? t`Saving...` : t`Save`}
          </Button>
          <Button variant="quiet" disabled={f.pending} onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
        </div>
      </form>
    </li>
  );
}

function DeleteDay({
  day,
  from,
  to,
  timezone,
  affected,
  momentCount,
  calls,
  onChanged,
  onClose,
}: {
  day: AdminEventDay;
  from: string;
  to: string;
  timezone: string;
  affected: string[];
  momentCount: number;
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
  const sessionCount = affected.length;
  return (
    <li className="space-y-2 py-3">
      <p className="text-sm text-fg-muted">
        <Trans>
          {from} – {to} ({timezone})
        </Trans>
      </p>
      <p className="text-sm text-danger-fg">
        {affected.length === 0
          ? t`Delete this day? No scheduled sessions fall within its time window.`
          : plural(sessionCount, {
              one: "Delete this day? The following session scheduled within its time window will also be deleted:",
              other:
                "Delete this day? The following # sessions scheduled within its time window will also be deleted:",
            })}
      </p>
      {affected.length > 0 && (
        <ul className="list-inside list-disc text-sm text-danger-fg">
          {affected.map((title, i) => (
            <li key={`${title}-${i}`}>{title}</li>
          ))}
        </ul>
      )}
      {momentCount > 0 && (
        <p className="text-sm text-danger-fg">
          {plural(momentCount, {
            one: "Its shared moment will also be deleted.",
            other: "Its # shared moments will also be deleted.",
          })}
        </p>
      )}
      {affected.length > 0 && (
        <p className="text-sm text-fg-muted">
          <Trans>Their hosts and RSVPed guests are told.</Trans>
        </p>
      )}
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

function DayRow({
  day,
  timezone,
  sessions,
  momentCount,
  calls,
  onChanged,
}: {
  day: AdminEventDay;
  timezone: string;
  sessions: ScheduledSession[];
  momentCount: number;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const { mode, close, edit, remove } = useRowMode();
  const from = utcToZonedInput(day.start, timezone);
  const to = utcToZonedInput(day.end, timezone);

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
        from={from}
        to={to}
        timezone={timezone}
        affected={affected}
        momentCount={momentCount}
        calls={calls}
        onChanged={onChanged}
        onClose={close}
      />
    );
  }
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <p className="text-sm text-fg-muted">
        <Trans>
          {from} – {to} ({timezone})
        </Trans>
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="quiet"
          aria-label={t`Edit day ${from} – ${to} (${timezone})`}
          onClick={edit}
        >
          <Trans>Edit</Trans>
        </Button>
        <Button
          variant="danger"
          aria-label={t`Delete day ${from} – ${to} (${timezone})`}
          onClick={remove}
        >
          <Trans>Delete</Trans>
        </Button>
      </div>
    </li>
  );
}

export function EventDaysManager({
  eventId,
  timezone,
  days,
  moments,
  sessions,
  calls,
  onChanged,
}: {
  eventId: string;
  timezone: string;
  days: AdminEventDay[];
  moments: AdminEventMoment[];
  sessions: ScheduledSession[];
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  return (
    <section aria-label={t`Days`} className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">
        <Trans>Days</Trans>
      </h2>
      <p className="text-sm text-fg-subtle">
        <Trans>
          The event&apos;s dates are the days you add here. All times are in the
          event timezone ({timezone}).
        </Trans>
      </p>
      {days.length > 0 && (
        <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
          {days.map((day) => (
            <DayRow
              key={day.id}
              day={day}
              timezone={timezone}
              sessions={sessions}
              momentCount={moments.filter((m) => m.dayId === day.id).length}
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
