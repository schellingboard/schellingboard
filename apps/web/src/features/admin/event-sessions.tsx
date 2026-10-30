import { useState, type FormEvent } from "react";
import { DateTime } from "luxon";
import { utcToZonedInput } from "@schellingboard/domain/admin-datetime";
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
import type { Person } from "../../ui/people-picker";
import {
  EMPTY_SESSION,
  sessionBody,
  startInstant,
  sessionFormValues,
  type DayOption,
  type SessionFormValues,
} from "./admin-session-model";
import {
  LIST_PAGE_SIZE,
  pageOf,
  plural,
  searchByTitleOrHost,
  tableHandlers,
  type OnParams,
} from "./list-paging";
import { ConfirmByTyping } from "./confirm-by-typing";
import { RoomCheckboxes } from "./room-checkboxes";
import { shown, useJumpWithin } from "./use-section-save";

export type EventLocation = { id: string; name: string; capacity: number };

const FIELDS = [
  "title",
  "description",
  "startTime",
  "endTime",
  "capacity",
  "hostIds",
  "locationIds",
];

const joinNames = (items: { name: string }[]) =>
  items.length > 0 ? items.map((i) => i.name).join(", ") : "—";

function SessionForm({
  initial,
  label,
  timezone,
  days,
  breakMinutes,
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
  const set = <K extends keyof SessionFormValues>(
    key: K,
    value: SessionFormValues[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const rooms = locations.filter((l) => form.locationIds.includes(l.id));
  const capacity =
    form.capacity ?? String(rooms.length === 1 ? rooms[0].capacity : 0);
  const day = days.find((d) => d.key === form.dayKey);
  const shift =
    breakMinutes && breakBefore && !form.blocker && day ? breakMinutes : 0;
  const parsed = sessionBody({ ...form, capacity }, days, timezone, shift);
  const start = startInstant(form, days, timezone, shift);

  const mutation = useFormMutation({
    call: (key) => call(parsed.body as AdminSessionBody, key),
    fieldNames: FIELDS,
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
        label="Title"
        name="title"
        required
        value={form.title}
        onChange={(v) => set("title", v)}
        error={errors.title}
      />
      <TextAreaField
        label="Description"
        name="description"
        hint="Markdown supported"
        value={form.description}
        onChange={(v) => set("description", v)}
        error={errors.description}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SelectField
          label="Day"
          value={form.dayKey}
          onChange={(v) => set("dayKey", v)}
          options={[
            { value: "", label: "Not scheduled" },
            ...days.map((d) => ({ value: d.key, label: d.label })),
          ]}
        />
        <DateTimeField
          label={`Start (${timezone})`}
          name="startTime"
          kind="time"
          required={!!day}
          disabled={!day}
          value={form.startTime}
          onChange={(v) => set("startTime", v)}
          error={errors.startTime}
        />
        <DateTimeField
          label={`End (${timezone})`}
          name="endTime"
          kind="time"
          required={!!day}
          disabled={!day}
          value={form.endTime}
          onChange={(v) => set("endTime", v)}
          error={errors.endTime}
        />
      </div>
      {!!breakMinutes && !form.blocker && (
        <div className="space-y-1">
          <CheckboxField
            label={`Break before (${breakMinutes} min)`}
            checked={breakBefore}
            onChange={setBreakBefore}
          />
          {start && (
            <p className="text-sm text-fg-subtle">
              Starts at{" "}
              {DateTime.fromISO(start).setZone(timezone).toFormat("HH:mm")}
            </p>
          )}
        </div>
      )}
      <TextField
        label="Capacity"
        name="capacity"
        type="number"
        min={0}
        value={capacity}
        onChange={(v) => set("capacity", v)}
        error={errors.capacity}
      />
      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm text-fg-muted">Flags</legend>
        <CheckboxField
          label="Blocker"
          checked={form.blocker}
          onChange={(v) => set("blocker", v)}
        />
        <CheckboxField
          label="Closed"
          checked={form.closed}
          onChange={(v) => set("closed", v)}
        />
        <CheckboxField
          label="Admin-managed"
          checked={form.adminManaged}
          onChange={(v) => set("adminManaged", v)}
        />
      </fieldset>
      {hosts.length === 0 ? (
        <p className="text-sm text-fg-subtle">
          No guests assigned to this event yet.
        </p>
      ) : (
        <PeopleField
          label="Hosts"
          name="hostIds"
          people={hosts}
          selected={form.hostIds}
          onChange={(v) => set("hostIds", v)}
          error={errors.hostIds}
        />
      )}
      {locations.length === 0 ? (
        <p className="text-sm text-fg-subtle">
          No locations assigned to this event yet.
        </p>
      ) : (
        <RoomCheckboxes
          legend="Locations"
          rooms={locations}
          selectedIds={form.locationIds}
          onChange={(v) => set("locationIds", v)}
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
          Cancel
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
            <span className="text-danger-fg">Remove?</span>
            <button
              type="button"
              disabled={mutation.pending}
              onClick={() => void remove()}
              className="text-danger-fg hover:underline"
            >
              Confirm
            </button>
            <button
              type="button"
              disabled={mutation.pending}
              onClick={() => setConfirming(false)}
              className="text-fg-subtle hover:underline"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            aria-label={`Remove RSVP ${name}`}
            onClick={() => setConfirming(true)}
            className="text-danger-fg hover:underline"
          >
            Remove
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
        RSVPs ({session.numRsvps})
      </summary>
      {guestIds === undefined ? (
        <p className="mt-2 text-fg-subtle">Loading…</p>
      ) : guestIds === null ? (
        <p role="alert" className="mt-2 text-danger-fg">
          Could not load the RSVPs.
        </p>
      ) : guestIds.length === 0 ? (
        <p className="mt-2 text-fg-subtle">No RSVPs.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {guestIds.map((id) => (
            <RsvpRow
              key={id}
              name={guestNames.get(id) ?? "Unknown guest"}
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
  return (
    <ConfirmByTyping
      heading={session.title}
      label="Type the session title to confirm"
      expected={session.title}
      warning={`This will permanently delete the session and its ${plural(session.numRsvps, "RSVP", "RSVPs")}. Host and location links are removed; the guests and locations themselves are kept.`}
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
  const [mode, setMode] = useState<"view" | "edit" | "duplicate" | "delete">(
    "view"
  );
  const [version, setVersion] = useState(session.version);
  const close = () => setMode("view");
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
          <h3 className="font-medium text-fg">Copy of {session.title}</h3>
        )}
        <SessionForm
          initial={form.values}
          label={`${duplicating ? "Copy of" : "Edit"} ${session.title}`}
          timezone={ctx.timezone}
          days={form.days}
          hosts={hosts}
          locations={locations}
          submitLabel={duplicating ? "Create" : "Save"}
          pendingLabel={duplicating ? "Creating..." : "Saving..."}
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
    session.blocker && "blocker",
    session.closed && "closed",
    session.adminManaged && "admin-managed",
  ].filter(Boolean);
  const when =
    session.startTime && session.endTime
      ? `${utcToZonedInput(session.startTime, ctx.timezone)} – ${utcToZonedInput(
          session.endTime,
          ctx.timezone
        )} (${ctx.timezone})`
      : "Not scheduled";

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-fg">{session.title}</p>
          <p className="text-sm text-fg-subtle">
            {when} · {joinNames(session.locations)}
          </p>
          <p className="text-sm text-fg-subtle">
            Hosts: {joinNames(session.hosts)} · {session.numRsvps} RSVPs
            {flags.length > 0 ? ` · ${flags.join(", ")}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="quiet"
            aria-label={`Edit ${session.title}`}
            onClick={() => {
              setVersion(session.version);
              setMode("edit");
            }}
          >
            Edit
          </Button>
          <Button
            variant="quiet"
            aria-label={`Duplicate ${session.title}`}
            onClick={() => setMode("duplicate")}
          >
            Duplicate
          </Button>
          <Button
            variant="danger"
            aria-label={`Delete ${session.title}`}
            onClick={() => setMode("delete")}
          >
            Delete
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
  if (!open) return <Button onClick={() => setOpen(true)}>Add session</Button>;
  return (
    <div className="space-y-3 rounded-md border border-line-subtle p-4">
      <h3 className="font-medium text-fg">New session</h3>
      <SessionForm
        initial={EMPTY_SESSION}
        label="New session"
        timezone={ctx.timezone}
        days={ctx.days}
        breakMinutes={breakMinutes}
        hosts={ctx.guests}
        locations={ctx.locations}
        submitLabel="Create"
        pendingLabel="Creating..."
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
  const { query, matching } = searchByTitleOrHost(sessions, params);
  const { page, visible } = pageOf(matching, params);

  return (
    <section aria-label="Sessions" className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">Sessions</h2>
      <p className="text-sm text-fg-subtle">
        All times are in the event timezone ({ctx.timezone}).
      </p>
      <AddSession ctx={ctx} breakMinutes={breakMinutes} />
      <DataTable
        rows={visible}
        rowKey={(s) => s.id}
        total={matching.length}
        page={page}
        pageSize={LIST_PAGE_SIZE}
        searchQuery={query}
        {...tableHandlers(onParams)}
        searchPlaceholder="Search title or host…"
        emptyMessage="No sessions match."
        listItem={(s) => <SessionItem session={s} ctx={ctx} />}
      />
    </section>
  );
}
