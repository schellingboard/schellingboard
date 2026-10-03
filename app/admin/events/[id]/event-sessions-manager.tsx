"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/app/input";
import {
  adminCreateSessionAction,
  adminUpdateSessionAction,
  adminDeleteSessionAction,
} from "@/app/actions/admin-sessions";
import { adminRemoveRsvpAction } from "@/app/actions/admin-rsvps";
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  DANGER_BUTTON,
} from "@/app/admin/buttons";
import { DataTable } from "../../data-table";
import { RoomCheckboxes } from "@/app/admin/room-checkboxes";
import { ActionError } from "@/app/components/action-error";
import { SelectHosts } from "@/app/select-hosts";
import {
  calendarDayOf,
  dayIndexOf,
  dayTimeToUtc,
  utcToZonedInput,
  type DayRange,
} from "@/utils/admin-datetime";
import { MarkdownHint } from "@/app/(site)/markdown";
import { DateTime } from "luxon";

export type SessionRow = {
  id: string;
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  capacity: number;
  adminManaged: boolean;
  blocker: boolean;
  closed: boolean;
  hosts: { id: string; name: string }[];
  locations: EventLocation[];
  numRsvps: number;
  rsvps: { guestId: string; name: string }[];
};

export type EventGuest = { id: string; name: string };
export type DayOption = DayRange & { key: string; label: string };
export type EventLocation = { id: string; name: string; capacity: number };

function joinNames(items: { name: string }[]): string {
  return items.length > 0 ? items.map((i) => i.name).join(", ") : "—";
}

function timeLabel(session: SessionRow, timezone: string): string {
  if (!session.startTime || !session.endTime) return "Not scheduled";
  return `${utcToZonedInput(session.startTime, timezone)} – ${utcToZonedInput(
    session.endTime,
    timezone
  )} (${timezone})`;
}

function flagLabels(session: SessionRow): string[] {
  const flags: string[] = [];
  if (session.blocker) flags.push("blocker");
  if (session.closed) flags.push("closed");
  if (session.adminManaged) flags.push("admin-managed");
  return flags;
}

function toIsoOrNull(
  day: DayRange | undefined,
  time: string,
  timezone: string
): string | null {
  return (day && dayTimeToUtc(day, time, timezone)) || null;
}

type SessionFormValues = {
  title: string;
  description: string;
  dayKey: string;
  startTime: string;
  endTime: string;
  /** null while it follows the room's capacity. */
  capacity: string | null;
  adminManaged: boolean;
  blocker: boolean;
  closed: boolean;
  hostIds: string[];
  locationIds: string[];
};

type SessionInput = ReturnType<typeof toActionInput>;

// A session on a date outside the event's days keeps that date as an extra
// option, so editing it doesn't unschedule it.
function sessionFormValues(
  session: SessionRow,
  days: DayOption[],
  timezone: string
): { values: SessionFormValues; days: DayOption[] } {
  const values = {
    title: session.title,
    description: session.description,
    dayKey: "",
    startTime: "",
    endTime: "",
    capacity: String(session.capacity),
    adminManaged: session.adminManaged,
    blocker: session.blocker,
    closed: session.closed,
    hostIds: session.hosts.map((h) => h.id),
    locationIds: session.locations.map((l) => l.id),
  };
  if (!session.startTime || !session.endTime) return { values, days };
  const time = (iso: string) => utcToZonedInput(iso, timezone).slice(11);
  const scheduled = {
    ...values,
    startTime: time(session.startTime),
    endTime: time(session.endTime),
  };
  const index = dayIndexOf(session.startTime, days, timezone);
  if (index >= 0)
    return { values: { ...scheduled, dayKey: days[index].key }, days };
  const other: DayOption = {
    key: "other",
    label: `${utcToZonedInput(session.startTime, timezone).slice(0, 10)} (not an event day)`,
    ...calendarDayOf(session.startTime, timezone),
  };
  return {
    values: { ...scheduled, dayKey: other.key },
    days: [...days, other],
  };
}

// Shared shape of the create/update action payloads (everything but the ids).
function toActionInput(
  values: SessionFormValues,
  day: DayRange | undefined,
  timezone: string
) {
  return {
    title: values.title,
    description: values.description,
    startTime: toIsoOrNull(day, values.startTime, timezone),
    endTime: toIsoOrNull(day, values.endTime, timezone),
    // Empty means 0; anything else passes through (NaN included) so the
    // server's capacity validation rejects it instead of saving a silent 0.
    capacity: values.capacity === "" ? 0 : Number(values.capacity),
    adminManaged: values.adminManaged,
    blocker: values.blocker,
    closed: values.closed,
    hostIds: values.hostIds,
    locationIds: values.locationIds,
  };
}

function SessionRsvps({
  session,
  onError,
}: {
  session: SessionRow;
  onError: (e: string | null) => void;
}) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const remove = (guestId: string) => {
    setPendingId(guestId);
    startTransition(async () => {
      try {
        const result = await adminRemoveRsvpAction({
          sessionId: session.id,
          guestId,
        });
        if (!result.ok) {
          onError(result.error);
        } else {
          onError(null);
          router.refresh();
        }
      } catch {
        onError("Request failed");
      } finally {
        setPendingId(null);
        setConfirmingId(null);
      }
    });
  };

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-fg-muted">
        RSVPs ({session.rsvps.length})
      </summary>
      {session.rsvps.length === 0 ? (
        <p className="mt-2 text-fg-subtle">No RSVPs.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {session.rsvps.map((r) => (
            <li
              key={r.guestId}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-fg-muted">{r.name}</span>
              {confirmingId === r.guestId ? (
                <span className="flex items-center gap-2">
                  <span className="text-danger-fg">Remove?</span>
                  <button
                    onClick={() => remove(r.guestId)}
                    disabled={pendingId === r.guestId}
                    className="text-danger-fg hover:underline"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmingId(null)}
                    disabled={pendingId === r.guestId}
                    className="text-fg-subtle hover:underline"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmingId(r.guestId)}
                  className="text-danger-fg hover:underline"
                  aria-label={`Remove RSVP ${r.name}`}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

function SessionForm({
  initial,
  idPrefix,
  label,
  timezone,
  days,
  breakMinutes,
  hostCandidates,
  locationCandidates,
  submitLabel,
  pendingLabel,
  isPending,
  error,
  onSubmit,
  onCancel,
}: {
  initial: SessionFormValues;
  idPrefix: string;
  label: string;
  timezone: string;
  days: DayOption[];
  /** Offers to start a new session after the event's break. */
  breakMinutes?: number;
  hostCandidates: EventGuest[];
  locationCandidates: EventLocation[];
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (input: SessionInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [dayKey, setDayKey] = useState(initial.dayKey);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [capacityInput, setCapacityInput] = useState(initial.capacity);
  const [adminManaged, setAdminManaged] = useState(initial.adminManaged);
  const [blocker, setBlocker] = useState(initial.blocker);
  const [closed, setClosed] = useState(initial.closed);
  const [hosts, setHosts] = useState<EventGuest[]>(
    initial.hostIds.flatMap(
      (id) => hostCandidates.find((g) => g.id === id) ?? []
    )
  );
  const [locationIds, setLocationIds] = useState<string[]>(initial.locationIds);
  const [breakBefore, setBreakBefore] = useState(true);
  const rooms = locationCandidates.filter((l) => locationIds.includes(l.id));
  const capacity =
    capacityInput ?? String(rooms.length === 1 ? rooms[0].capacity : 0);
  const day = days.find((d) => d.key === dayKey);
  const start = toIsoOrNull(day, startTime, timezone);
  const savedStart =
    start && breakMinutes && breakBefore && !blocker
      ? DateTime.fromISO(start).plus({ minutes: breakMinutes })
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = toActionInput(
      {
        title,
        description,
        dayKey,
        startTime,
        endTime,
        capacity,
        adminManaged,
        blocker,
        closed,
        hostIds: hosts.map((h) => h.id),
        locationIds,
      },
      day,
      timezone
    );
    onSubmit(savedStart ? { ...input, startTime: savedStart.toISO() } : input);
  };

  return (
    <form onSubmit={handleSubmit} aria-label={label} className="space-y-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-title`} className="text-sm text-fg-muted">
          Title *
        </label>
        <Input
          id={`${idPrefix}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full h-10"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-desc`} className="text-sm text-fg-muted">
          Description
        </label>
        <textarea
          id={`${idPrefix}-desc`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm shadow-sm resize-y h-24 focus:outline-none focus:ring-2 focus:ring-line"
        />
        <MarkdownHint />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-day`} className="text-sm text-fg-muted">
            Day
          </label>
          <select
            id={`${idPrefix}-day`}
            value={dayKey}
            onChange={(e) => setDayKey(e.target.value)}
            className="w-full h-10 rounded-md border border-line bg-surface-raised px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            <option value="">Not scheduled</option>
            {days.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${idPrefix}-start`}
            className="text-sm text-fg-muted"
          >
            Start ({timezone})
          </label>
          <Input
            id={`${idPrefix}-start`}
            type="time"
            step={60}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required={!!day}
            disabled={!day}
            className="w-full h-10"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-end`} className="text-sm text-fg-muted">
            End ({timezone})
          </label>
          <Input
            id={`${idPrefix}-end`}
            type="time"
            step={60}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required={!!day}
            disabled={!day}
            className="w-full h-10"
          />
        </div>
      </div>
      {!!breakMinutes && !blocker && (
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={breakBefore}
              onChange={(e) => setBreakBefore(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            Break before ({breakMinutes} min)
          </label>
          {start && (
            <p className="text-sm text-fg-subtle">
              Starts at{" "}
              {(savedStart ?? DateTime.fromISO(start))
                .setZone(timezone)
                .toFormat("HH:mm")}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${idPrefix}-capacity`}
          className="text-sm text-fg-muted"
        >
          Capacity
        </label>
        <Input
          id={`${idPrefix}-capacity`}
          type="number"
          min="0"
          value={capacity}
          onChange={(e) => setCapacityInput(e.target.value)}
          className="w-full h-10"
        />
      </div>
      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm text-fg-muted">Flags</legend>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={blocker}
            onChange={(e) => setBlocker(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          Blocker
        </label>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={closed}
            onChange={(e) => setClosed(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          Closed
        </label>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={adminManaged}
            onChange={(e) => setAdminManaged(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          Admin-managed
        </label>
      </fieldset>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-hosts`} className="text-sm text-fg-muted">
          Hosts
        </label>
        {hostCandidates.length === 0 ? (
          <p className="text-sm text-fg-subtle">
            No guests assigned to this event yet.
          </p>
        ) : (
          <SelectHosts
            guests={hostCandidates}
            hosts={hosts}
            setHosts={setHosts}
            id={`${idPrefix}-hosts`}
            selectMany
          />
        )}
      </div>
      {locationCandidates.length === 0 ? (
        <p className="text-sm text-fg-subtle">
          No locations assigned to this event yet.
        </p>
      ) : (
        <RoomCheckboxes
          legend="Locations"
          rooms={locationCandidates}
          selectedIds={locationIds}
          onChange={setLocationIds}
        />
      )}
      <ActionError message={error} />
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className={PRIMARY_BUTTON}>
          {isPending ? pendingLabel : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className={SECONDARY_BUTTON}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SessionItem({
  eventId,
  session,
  eventGuests,
  eventLocations,
  timezone,
  days,
}: {
  eventId: string;
  session: SessionRow;
  eventGuests: EventGuest[];
  eventLocations: EventLocation[];
  timezone: string;
  days: DayOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"edit" | "duplicate" | null>(null);
  const [isSaving, startSave] = useTransition();
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, startDelete] = useTransition();

  // Offer event-assigned guests as hosts, plus any current host that is not
  // (or no longer) assigned to the event so existing hosts are never dropped.
  const hostCandidates: EventGuest[] = [
    ...eventGuests,
    ...session.hosts.filter((h) => !eventGuests.some((g) => g.id === h.id)),
  ];
  const locationCandidates: EventLocation[] = [
    ...eventLocations,
    ...session.locations.filter(
      (l) => !eventLocations.some((e) => e.id === l.id)
    ),
  ];

  const handleSave = (input: SessionInput) => {
    startSave(async () => {
      try {
        const result =
          formMode === "duplicate"
            ? await adminCreateSessionAction({ eventId, ...input })
            : await adminUpdateSessionAction({ id: session.id, ...input });
        if (!result.ok) {
          setError(result.error);
        } else {
          setError(null);
          setFormMode(null);
          router.refresh();
        }
      } catch {
        setError("Request failed");
      }
    });
  };

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await adminDeleteSessionAction({ id: session.id });
        if (!result.ok) {
          setError(result.error);
        } else {
          setError(null);
          router.refresh();
        }
      } catch {
        setError("Request failed");
      }
    });
  };

  if (deleteMode) {
    return (
      <div className="space-y-2">
        <p className="font-medium text-fg">{session.title}</p>
        <p className="text-sm text-danger-fg">
          This will permanently delete the session and its {session.numRsvps}{" "}
          {session.numRsvps === 1 ? "RSVP" : "RSVPs"}. Host and location links
          are removed; the guests and locations themselves are kept.
        </p>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`sess-delete-${session.id}`}
            className="text-sm text-fg-muted"
          >
            Type the session title to confirm
          </label>
          <Input
            id={`sess-delete-${session.id}`}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={session.title}
            className="w-full h-10"
          />
        </div>
        <ActionError message={error} />
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting || deleteConfirm !== session.title}
            className={DANGER_BUTTON}
          >
            {isDeleting ? "Deleting..." : "Confirm delete"}
          </button>
          <button
            onClick={() => {
              setDeleteMode(false);
              setDeleteConfirm("");
              setError(null);
            }}
            disabled={isDeleting}
            className={SECONDARY_BUTTON}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!formMode) {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-medium text-fg">{session.title}</p>
            <p className="text-sm text-fg-subtle">
              {timeLabel(session, timezone)} · {joinNames(session.locations)}
            </p>
            <p className="text-sm text-fg-subtle">
              Hosts: {joinNames(session.hosts)} · {session.numRsvps} RSVPs
              {flagLabels(session).length > 0
                ? ` · ${flagLabels(session).join(", ")}`
                : ""}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setError(null);
                setFormMode("edit");
              }}
              className={SECONDARY_BUTTON}
              aria-label={`Edit ${session.title}`}
            >
              Edit
            </button>
            <button
              onClick={() => {
                setError(null);
                setFormMode("duplicate");
              }}
              className={SECONDARY_BUTTON}
              aria-label={`Duplicate ${session.title}`}
            >
              Duplicate
            </button>
            <button
              onClick={() => {
                setError(null);
                setDeleteMode(true);
              }}
              className={DANGER_BUTTON}
              aria-label={`Delete ${session.title}`}
            >
              Delete
            </button>
          </div>
        </div>
        <SessionRsvps session={session} onError={setError} />
        <ActionError message={error} />
      </div>
    );
  }

  const form = sessionFormValues(session, days, timezone);
  const duplicating = formMode === "duplicate";
  return (
    <div className="space-y-3">
      {duplicating && (
        <h3 className="font-medium text-fg">Copy of {session.title}</h3>
      )}
      <SessionForm
        initial={form.values}
        idPrefix={`sess-${session.id}`}
        label={`${duplicating ? "Copy of" : "Edit"} ${session.title}`}
        timezone={timezone}
        days={form.days}
        hostCandidates={hostCandidates}
        locationCandidates={locationCandidates}
        submitLabel={duplicating ? "Create" : "Save"}
        pendingLabel={duplicating ? "Creating..." : "Saving..."}
        isPending={isSaving}
        error={error}
        onSubmit={handleSave}
        onCancel={() => {
          setFormMode(null);
          setError(null);
        }}
      />
    </div>
  );
}

// Sessions created by an admin are admin-managed by default: they stay under
// admin control instead of being editable by their hosts.
const EMPTY_SESSION: SessionFormValues = {
  title: "",
  description: "",
  dayKey: "",
  startTime: "",
  endTime: "",
  capacity: null,
  adminManaged: true,
  blocker: false,
  closed: false,
  hostIds: [],
  locationIds: [],
};

function AddSession({
  eventId,
  eventGuests,
  eventLocations,
  timezone,
  days,
  breakMinutes,
}: {
  eventId: string;
  eventGuests: EventGuest[];
  eventLocations: EventLocation[];
  timezone: string;
  days: DayOption[];
  breakMinutes: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isCreating, startCreate] = useTransition();

  const handleCreate = (input: SessionInput) => {
    startCreate(async () => {
      try {
        const result = await adminCreateSessionAction({ eventId, ...input });
        if (!result.ok) {
          setError(result.error);
        } else {
          setError(null);
          setOpen(false);
          router.refresh();
        }
      } catch {
        setError("Request failed");
      }
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={PRIMARY_BUTTON}>
        Add session
      </button>
    );
  }

  return (
    <div className="space-y-3 border border-line-subtle rounded-md p-4">
      <h3 className="font-medium text-fg">New session</h3>
      <SessionForm
        initial={EMPTY_SESSION}
        idPrefix="sess-new"
        label="New session"
        timezone={timezone}
        days={days}
        breakMinutes={breakMinutes}
        hostCandidates={eventGuests}
        locationCandidates={eventLocations}
        submitLabel="Create"
        pendingLabel="Creating..."
        isPending={isCreating}
        error={error}
        onSubmit={handleCreate}
        onCancel={() => {
          setOpen(false);
          setError(null);
        }}
      />
    </div>
  );
}

export function EventSessionsManager({
  eventId,
  sessions,
  eventGuests,
  eventLocations,
  timezone,
  days,
  breakMinutes,
  total,
  page,
  pageSize,
  query,
}: {
  eventId: string;
  sessions: SessionRow[];
  eventGuests: EventGuest[];
  eventLocations: EventLocation[];
  timezone: string;
  days: DayOption[];
  breakMinutes: number;
  total: number;
  page: number;
  pageSize: number;
  query: string;
}) {
  return (
    <section aria-label="Sessions" className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">Sessions</h2>
      <p className="text-sm text-fg-subtle">
        All times are in the event timezone ({timezone}).
      </p>
      <AddSession
        eventId={eventId}
        eventGuests={eventGuests}
        eventLocations={eventLocations}
        timezone={timezone}
        days={days}
        breakMinutes={breakMinutes}
      />

      <DataTable
        rows={sessions}
        rowKey={(s) => s.id}
        total={total}
        page={page}
        pageSize={pageSize}
        searchQuery={query}
        searchPlaceholder="Search title or host…"
        emptyMessage="No sessions match."
        listItem={(s) => (
          <SessionItem
            eventId={eventId}
            session={s}
            eventGuests={eventGuests}
            eventLocations={eventLocations}
            timezone={timezone}
            days={days}
          />
        )}
      />
    </section>
  );
}
