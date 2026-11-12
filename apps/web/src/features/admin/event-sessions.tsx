import { plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { utcToZonedInput } from "@schellingboard/domain/admin-datetime";
import { DateTime } from "luxon";
import { type FormEvent, useState } from "react";

import type {
  AdminEventCalls,
  AdminSessionBody,
} from "../../commands/admin-events";
import type { FieldErrors } from "../../commands/mutation";
import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminSession } from "../../queries/admin-sessions";
import { Button } from "../../ui/button";
import { DataTable } from "../../ui/data-table";
import {
  CheckboxField,
  DateTimeField,
  PeopleField,
  SelectField,
  TextAreaField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import {
  type OnParams,
  pageOf,
  searchByTitleOrHost,
  tableHandlers,
} from "../../ui/list-paging";
import type { Person } from "../../ui/people-picker";
import {
  type DayOption,
  EMPTY_SESSION,
  sessionBody,
  type SessionFormValues,
  sessionFormValues,
  startInstant,
} from "./admin-session-model";
import { ConfirmByTyping } from "./confirm-by-typing";
import { RoomCheckboxes } from "./room-checkboxes";
import { useRowMode } from "./row-mode";
import { shown, useJumpWithin } from "./use-section-save";

export type EventLocation = { id: string; name: string; capacity: number };

const joinNames = (items: { name: string }[]) =>
  items.length > 0 ? items.map((i) => i.name).join(", ") : "—";

export function SessionForm({
  initial,
  label,
  timezone,
  days,
  breakMinutes,
  durationMinutes,
  hosts,
  locations,
  submitLabel,
  pendingLabel,
  call,
  onChanged,
  onClose,
}: {
  initial: SessionFormValues;
  label: string;
  timezone: string;
  days: DayOption[];
  /** Offers to start a new session after the event's break. */
  breakMinutes?: number;
  /** The end follows the start by this long until it is typed. */
  durationMinutes?: number | null;
  hosts: Person[];
  locations: EventLocation[];
  submitLabel: string;
  pendingLabel: string;
  call: (
    body: AdminSessionBody,
    key: string
  ) => Promise<CommandResponse<unknown>>;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [form, setForm] = useState(initial);
  const [breakBefore, setBreakBefore] = useState(true);
  const [checking, setChecking] = useState(false);
  const [endTyped, setEndTyped] = useState(false);
  const setField = <K extends keyof SessionFormValues>(
    key: K,
    value: SessionFormValues[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const rooms = locations.filter((l) => form.locationIds.includes(l.id));
  const capacity =
    form.capacity ?? String(rooms.length === 1 ? rooms[0].capacity : 0);
  const day = days.find((d) => d.key === form.dayKey);
  const shift =
    breakMinutes && breakBefore && !form.blocker && day ? breakMinutes : 0;
  const start = startInstant(form, days, timezone, shift);
  // A proposal's duration includes the break, as when attendees book it.
  const slotStart = startInstant(form, days, timezone);
  const endTime =
    !endTyped && durationMinutes && slotStart
      ? DateTime.fromISO(slotStart)
          .plus({ minutes: durationMinutes })
          .setZone(timezone)
          .toFormat("HH:mm")
      : form.endTime;
  const parsed = sessionBody(
    { ...form, capacity, endTime },
    days,
    timezone,
    shift
  );
  const startTime = start
    ? DateTime.fromISO(start).setZone(timezone).toFormat("HH:mm")
    : "";

  const mutation = useFormMutation({
    call: (key) => call(parsed.body as AdminSessionBody, key),
    fieldNames: [
      "title",
      "description",
      "startTime",
      "endTime",
      "capacity",
      "hostIds",
      "locationIds",
    ],
    explainRefusals: true,
  });
  const errors: FieldErrors = {
    ...(checking ? parsed.errors : {}),
    ...mutation.fields,
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (!parsed.body) return;
    const result = await mutation.submit();
    if (!result) return;
    if (result.ok) {
      onChanged();
      onClose();
    } else if (result.kind === "conflict") onChanged();
  };

  return (
    <form
      ref={ref}
      noValidate
      aria-label={label}
      onSubmit={(e) => void submit(e)}
      className="space-y-3"
    >
      <TextField
        label={t`Title`}
        name="title"
        required
        value={form.title}
        onChange={(v) => setField("title", v)}
        error={errors.title}
      />
      <TextAreaField
        label={t`Description`}
        name="description"
        hint={t`Markdown supported`}
        value={form.description}
        onChange={(v) => setField("description", v)}
        error={errors.description}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SelectField
          label={t({
            message: "Day",
            context: "Session form: the day it is on",
          })}
          value={form.dayKey}
          onChange={(v) => setField("dayKey", v)}
          options={[
            { value: "", label: t`Not scheduled` },
            ...days.map((d) => ({ value: d.key, label: d.label })),
          ]}
        />
        <DateTimeField
          label={t({
            message: `Start (${timezone})`,
            context: "Time field: when it begins",
          })}
          name="startTime"
          kind="time"
          required={!!day}
          disabled={!day}
          value={form.startTime}
          onChange={(v) => setField("startTime", v)}
          error={errors.startTime}
        />
        <DateTimeField
          label={t({
            message: `End (${timezone})`,
            context: "Time field: when it ends",
          })}
          name="endTime"
          kind="time"
          required={!!day}
          disabled={!day}
          value={endTime}
          onChange={(v) => {
            setEndTyped(true);
            setField("endTime", v);
          }}
          error={errors.endTime}
        />
      </div>
      {!!breakMinutes && !form.blocker && (
        <div className="space-y-1">
          <CheckboxField
            label={t`Break before (${breakMinutes} min)`}
            checked={breakBefore}
            onChange={setBreakBefore}
          />
          {start && (
            <p className="text-sm text-fg-subtle">
              <Trans>Starts at {startTime}</Trans>
            </p>
          )}
        </div>
      )}
      <TextField
        label={t`Capacity`}
        name="capacity"
        type="number"
        min={0}
        value={capacity}
        onChange={(v) => setField("capacity", v)}
        error={errors.capacity}
      />
      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm text-fg-muted">
          <Trans>Flags</Trans>
        </legend>
        <CheckboxField
          label={t`Blocker`}
          checked={form.blocker}
          onChange={(v) => setField("blocker", v)}
        />
        <CheckboxField
          label={t({ message: "Closed", context: "Session flag" })}
          checked={form.closed}
          onChange={(v) => setField("closed", v)}
        />
        <CheckboxField
          label={t`Admin-managed`}
          checked={form.adminManaged}
          onChange={(v) => setField("adminManaged", v)}
        />
      </fieldset>
      {hosts.length === 0 ? (
        <p className="text-sm text-fg-subtle">
          <Trans>No guests assigned to this event yet.</Trans>
        </p>
      ) : (
        <PeopleField
          label={t`Hosts`}
          name="hostIds"
          people={hosts}
          selected={form.hostIds}
          onChange={(v) => setField("hostIds", v)}
          error={errors.hostIds}
        />
      )}
      {locations.length === 0 ? (
        <p className="text-sm text-fg-subtle">
          <Trans>No locations assigned to this event yet.</Trans>
        </p>
      ) : (
        <RoomCheckboxes
          legend={t`Locations`}
          rooms={locations}
          selectedIds={form.locationIds}
          onChange={(v) => setField("locationIds", v)}
        />
      )}
      <FormErrorSummary
        fields={errors}
        error={shown(mutation.error)}
        onJump={jump}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? pendingLabel : submitLabel}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </form>
  );
}

function RsvpRow({
  name,
  sessionId,
  guestId,
  calls,
  onRemoved,
}: {
  name: string;
  sessionId: string;
  guestId: string;
  calls: AdminEventCalls;
  onRemoved: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const mutation = useFormMutation({
    call: (key) => calls.removeRsvp(sessionId, guestId, key),
    explainRefusals: true,
  });
  const remove = async () => {
    const result = await mutation.submit();
    if (result?.ok) onRemoved();
    setConfirming(false);
  };
  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg-muted">{name}</span>
        {confirming ? (
          <span className="flex items-center gap-2">
            <span className="text-danger-fg">
              <Trans>Remove?</Trans>
            </span>
            <button
              type="button"
              disabled={mutation.pending}
              onClick={() => void remove()}
              className="text-danger-fg hover:underline"
            >
              <Trans>Confirm</Trans>
            </button>
            <button
              type="button"
              disabled={mutation.pending}
              onClick={() => setConfirming(false)}
              className="text-fg-subtle hover:underline"
            >
              <Trans>Cancel</Trans>
            </button>
          </span>
        ) : (
          <button
            type="button"
            aria-label={t`Remove RSVP ${name}`}
            onClick={() => setConfirming(true)}
            className="text-danger-fg hover:underline"
          >
            <Trans>Remove</Trans>
          </button>
        )}
      </div>
      <FormErrorSummary
        fields={{}}
        error={shown(mutation.error)}
        onJump={() => {}}
      />
    </li>
  );
}

function SessionRsvps({
  session,
  guestNames,
  loadRsvps,
  calls,
  onChanged,
}: {
  session: AdminSession;
  guestNames: ReadonlyMap<string, string>;
  loadRsvps: (sessionId: string) => Promise<string[] | null>;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const rsvpCount = session.numRsvps;
  const [guestIds, setGuestIds] = useState<string[] | null | undefined>();
  const load = async () => setGuestIds(await loadRsvps(session.id));

  return (
    <details
      className="text-sm"
      onToggle={(e) => {
        if (e.currentTarget.open) void load();
      }}
    >
      <summary className="cursor-pointer text-fg-muted">
        {t`RSVPs (${rsvpCount})`}
      </summary>
      {guestIds === undefined ? (
        <p className="mt-2 text-fg-subtle">
          <Trans>Loading…</Trans>
        </p>
      ) : guestIds === null ? (
        <p role="alert" className="mt-2 text-danger-fg">
          <Trans>Could not load the RSVPs.</Trans>
        </p>
      ) : guestIds.length === 0 ? (
        <p className="mt-2 text-fg-subtle">
          <Trans>No RSVPs.</Trans>
        </p>
      ) : (
        <ul className="mt-2 space-y-1">
          {guestIds.map((id) => (
            <RsvpRow
              key={id}
              name={guestNames.get(id) ?? t`Unknown guest`}
              sessionId={session.id}
              guestId={id}
              calls={calls}
              onRemoved={() => {
                void load();
                onChanged();
              }}
            />
          ))}
        </ul>
      )}
    </details>
  );
}

function DeleteConfirm({
  session,
  calls,
  onChanged,
  onClose,
}: {
  session: AdminSession;
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const rsvpCount = session.numRsvps;
  return (
    <ConfirmByTyping
      heading={session.title}
      label={t`Type the session title to confirm`}
      expected={session.title}
      warning={t`This will permanently delete the session and its ${plural(
        rsvpCount,
        {
          one: "# RSVP",
          other: "# RSVPs",
        }
      )}. Host and location links are removed; the guests and locations themselves are kept.`}
      call={(key) => calls.deleteSession(session.id, key)}
      onDeleted={onChanged}
      onCancel={onClose}
    />
  );
}

type Context = {
  eventId: string;
  timezone: string;
  days: DayOption[];
  guests: Person[];
  locations: EventLocation[];
  guestNames: ReadonlyMap<string, string>;
  loadRsvps: (sessionId: string) => Promise<string[] | null>;
  calls: AdminEventCalls;
  onChanged: () => void;
};

function SessionItem({
  session,
  ctx,
}: {
  session: AdminSession;
  ctx: Context;
}) {
  const { mode, close, edit, duplicate, remove } = useRowMode();
  const [version, setVersion] = useState(session.version);
  const title = session.title;
  // A current host or location that left the event stays offered, so saving never drops it.
  const hosts = [
    ...ctx.guests,
    ...session.hosts.filter((h) => !ctx.guests.some((g) => g.id === h.id)),
  ];
  const locations = [
    ...ctx.locations,
    ...session.locations
      .filter((l) => !ctx.locations.some((e) => e.id === l.id))
      .map((l) => ({ ...l, capacity: 0 })),
  ];

  if (mode === "delete")
    return (
      <DeleteConfirm
        session={session}
        calls={ctx.calls}
        onChanged={ctx.onChanged}
        onClose={close}
      />
    );

  if (mode === "edit" || mode === "duplicate") {
    const duplicating = mode === "duplicate";
    const form = sessionFormValues(session, ctx.days, ctx.timezone);
    return (
      <div className="space-y-3">
        {duplicating && (
          <h3 className="font-medium text-fg">
            <Trans>Copy of {title}</Trans>
          </h3>
        )}
        <SessionForm
          initial={form.values}
          label={duplicating ? t`Copy of ${title}` : t`Edit ${title}`}
          timezone={ctx.timezone}
          days={form.days}
          hosts={hosts}
          locations={locations}
          submitLabel={duplicating ? t`Create` : t`Save`}
          pendingLabel={duplicating ? t`Creating...` : t`Saving...`}
          call={(body, key) =>
            duplicating
              ? ctx.calls.createSession({ eventId: ctx.eventId, ...body }, key)
              : ctx.calls.updateSession(session.id, body, version, key)
          }
          onChanged={ctx.onChanged}
          onClose={close}
        />
      </div>
    );
  }

  const flags = [
    session.blocker && t`blocker`,
    session.closed &&
      t({ message: "closed", context: "Session flag, in a lowercase list" }),
    session.adminManaged && t`admin-managed`,
  ].filter(Boolean);
  const timezone = ctx.timezone;
  const from = session.startTime
    ? utcToZonedInput(session.startTime, timezone)
    : "";
  const to = session.endTime ? utcToZonedInput(session.endTime, timezone) : "";
  const when =
    session.startTime && session.endTime
      ? t`${from} – ${to} (${timezone})`
      : t`Not scheduled`;
  const hostNames = joinNames(session.hosts);
  const rsvpCount = session.numRsvps;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-fg">{session.title}</p>
          <p className="text-sm text-fg-subtle">
            {when} · {joinNames(session.locations)}
          </p>
          <p className="text-sm text-fg-subtle">
            <Trans>Hosts: {hostNames}</Trans> ·{" "}
            {plural(rsvpCount, { one: "# RSVP", other: "# RSVPs" })}
            {flags.length > 0 ? ` · ${flags.join(", ")}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="quiet"
            aria-label={t`Edit ${title}`}
            onClick={() => {
              setVersion(session.version);
              edit();
            }}
          >
            <Trans>Edit</Trans>
          </Button>
          <Button
            variant="quiet"
            aria-label={t`Duplicate ${title}`}
            onClick={duplicate}
          >
            <Trans>Duplicate</Trans>
          </Button>
          <Button
            variant="danger"
            aria-label={t`Delete ${title}`}
            onClick={remove}
          >
            <Trans>Delete</Trans>
          </Button>
        </div>
      </div>
      <SessionRsvps
        session={session}
        guestNames={ctx.guestNames}
        loadRsvps={ctx.loadRsvps}
        calls={ctx.calls}
        onChanged={ctx.onChanged}
      />
    </div>
  );
}

function AddSession({
  ctx,
  breakMinutes,
}: {
  ctx: Context;
  breakMinutes: number;
}) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button onClick={() => setOpen(true)}>
        <Trans>Add session</Trans>
      </Button>
    );
  return (
    <div className="space-y-3 rounded-md border border-line-subtle p-4">
      <h3 className="font-medium text-fg">
        <Trans>New session</Trans>
      </h3>
      <SessionForm
        initial={EMPTY_SESSION}
        label={t`New session`}
        timezone={ctx.timezone}
        days={ctx.days}
        breakMinutes={breakMinutes}
        hosts={ctx.guests}
        locations={ctx.locations}
        submitLabel={t`Create`}
        pendingLabel={t`Creating...`}
        call={(body, key) =>
          ctx.calls.createSession({ eventId: ctx.eventId, ...body }, key)
        }
        onChanged={ctx.onChanged}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export function EventSessionsManager({
  sessions,
  breakMinutes,
  params,
  onParams,
  ...ctx
}: Context & {
  sessions: AdminSession[];
  breakMinutes: number;
  params: URLSearchParams;
  onParams: OnParams;
}) {
  const timezone = ctx.timezone;
  const hostless = params.get("hostless") === "1";
  const { query, matching } = searchByTitleOrHost(
    hostless ? sessions.filter((s) => s.hosts.length === 0) : sessions,
    params
  );
  const { page, pageSize, visible } = pageOf(matching, params);

  return (
    <section aria-label={t`Sessions`} className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">
        <Trans>Sessions</Trans>
      </h2>
      <p className="text-sm text-fg-subtle">
        <Trans>All times are in the event timezone ({timezone}).</Trans>
      </p>
      <AddSession ctx={ctx} breakMinutes={breakMinutes} />
      <DataTable
        rows={visible}
        rowKey={(s) => s.id}
        total={matching.length}
        page={page}
        pageSize={pageSize}
        searchQuery={query}
        {...tableHandlers(onParams)}
        searchPlaceholder={t`Search title or host…`}
        toolbar={
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={hostless}
              onChange={() =>
                onParams(
                  { hostless: hostless ? null : "1", page: null },
                  { push: true }
                )
              }
            />
            <Trans>No hosts</Trans>
          </label>
        }
        emptyMessage={t`No sessions match.`}
        listItem={(s) => <SessionItem session={s} ctx={ctx} />}
      />
    </section>
  );
}
