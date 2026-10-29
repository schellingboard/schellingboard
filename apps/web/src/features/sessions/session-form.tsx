import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  sessionCreateSchema,
  sessionUpdateSchema,
} from "@schellingboard/contracts/session";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import {
  durationMinusBreak,
  gridEndingDurations,
  snapDurationToSlots,
} from "@schellingboard/domain/slots";
import {
  buildSessionInterval,
  CAPACITY_ERROR,
  sessionHasStarted,
} from "@schellingboard/domain/session-booking";
import {
  convertParamDateTime,
  formatDayLabel,
  formatDuration,
  formatSlotLabel,
} from "@schellingboard/domain/time";
import { dateOnDay } from "@schellingboard/domain/event";
import {
  FIX_FIELDS_MESSAGE,
  validateFields,
  type FieldErrors,
} from "../../commands/mutation";
import type {
  SessionCreateBody,
  SessionFormCalls,
  SessionUpdateBody,
} from "../../commands/session-form";
import { useFormMutation } from "../../commands/use-form-mutation";
import { BackLink } from "../../ui/back-link";
import { Button } from "../../ui/button";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import {
  CheckboxField,
  FieldError,
  MarkdownField,
  PeopleField,
  SelectField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { useNotify } from "../../ui/notices";
import { ScheduledSessionsNotice } from "../proposals/scheduled-sessions-notice";
import {
  closestAtMost,
  dayFrom,
  hostClashLine,
  KEEP_ROOMS,
  minutesPastGrid,
  startTimesFor,
} from "./session-model";
import { useHostClashes } from "./use-host-clashes";

const FIELD_NAMES = [
  "title",
  "description",
  "closed",
  "hostIds",
  "locationId",
  "locationIds",
  "capacity",
  "dayId",
  "startTime",
  "durationMinutes",
];

const CONFIRMATION_MS = 10_000;

export type SessionFormLinks = {
  schedule: string;
  proposal: (proposalId: string) => string;
  session: (sessionId: string) => string;
};

/** What the schedule's free cells and the proposal list put in the address. */
export type SessionPrefill = {
  day?: string;
  time?: string;
  location?: string;
  proposalId?: string;
};

export type SessionFormProps = {
  snapshot: Snapshot;
  now: Date;
  /** Edits this session; a new one when left out. */
  sessionId?: string;
  prefill?: SessionPrefill;
  links: SessionFormLinks;
  /** Stable between renders: a new one asks the server about the hosts again. */
  actions: SessionFormCalls;
  /** Saved or deleted: the caller leaves the form. */
  onDone: () => void;
};

/** The add and edit session screens. */
export function SessionForm(props: SessionFormProps) {
  const { snapshot, sessionId, links } = props;
  const viewer = snapshot.me?.guestId ?? null;
  const session = sessionId
    ? snapshot.sessions.find((s) => s.id === sessionId)
    : undefined;

  const refusal = (() => {
    if (sessionId && !session) return "Session not found.";
    if (snapshot.days.length === 0)
      return "This event has no days to schedule a session on yet.";
    if (!viewer)
      return actingGuestRefusalMessage(
        "guest.unselected",
        session ? "editing a session" : "adding a session"
      );
    return null;
  })();

  if (refusal || !viewer)
    return (
      <div className="mx-auto max-w-2xl px-4">
        <BackLink href={links.schedule}>Schedule</BackLink>
        <div className="mt-6">{refusal}</div>
      </div>
    );
  return <Fields {...props} viewer={viewer} session={session} />;
}

function Fields({
  snapshot,
  now,
  prefill,
  links,
  actions,
  onDone,
  viewer,
  session,
}: SessionFormProps & {
  viewer: string;
  session: Snapshot["sessions"][number] | undefined;
}) {
  const { event } = snapshot;
  const { timezone, breakMinutes, slotIncrementMinutes } = event;
  const maxSessionDuration = event.maxSessionDuration;
  const notify = useNotify();
  const formRef = useRef<HTMLFormElement>(null);
  const body = useRef<SessionCreateBody | SessionUpdateBody | null>(null);
  const [loadedVersion] = useState(session?.version);
  const editing = !!session;

  const days = useMemo(() => snapshot.days.map(dayFrom), [snapshot.days]);
  const breakMs = breakMinutes * 60 * 1000;
  const ownStart = session?.startTime ? new Date(session.startTime) : undefined;
  const ownEnd = session?.endTime ? new Date(session.endTime) : undefined;
  // The form works in slots, and a session starts once its slot's break is
  // over, so a breakless session sits in a slot off the grid.
  const ownSlot = ownStart ? ownStart.getTime() - breakMs : undefined;
  const lockedStart =
    ownSlot !== undefined && sessionHasStarted({ startTime: ownStart }, now)
      ? ownSlot
      : null;

  const ownRooms = snapshot.locations.filter((l) =>
    session?.locationIds.includes(l.id)
  );
  const locations = snapshot.locations.filter(
    (l) => l.bookable || ownRooms.includes(l)
  );
  const ownRoomsChoice = ownRooms.length > 1 ? KEEP_ROOMS : ownRooms[0]?.id;

  const proposals = snapshot.proposals.filter(
    (p) => p.hosts.length === 0 || p.hosts.some((h) => h.id === viewer)
  );
  const initialProposal =
    proposals.find((p) => p.id === prefill?.proposalId) ?? null;

  const paramDateTime =
    prefill?.day && prefill.time
      ? convertParamDateTime(prefill.day, prefill.time, timezone)
      : null;
  const initDateTime = paramDateTime ?? ownStart ?? null;
  const initDay = initDateTime
    ? days.find((d) => dateOnDay(initDateTime, d))
    : undefined;
  const initSlot = paramDateTime?.getTime() ?? ownSlot;
  const sessionDuration =
    ownSlot !== undefined && ownEnd
      ? Math.round((ownEnd.getTime() - ownSlot) / 1000 / 60)
      : null;

  const [proposal, setProposal] = useState(initialProposal);
  const [usedProposal, setUsedProposal] = useState(!!initialProposal);
  const [title, setTitle] = useState(
    initialProposal?.title ?? session?.title ?? ""
  );
  const [description, setDescription] = useState(
    initialProposal?.description ?? session?.description ?? ""
  );
  const [closed, setClosed] = useState(session?.closed ?? false);
  const [dayId, setDayId] = useState((initDay ?? days[0])?.id);
  const day = days.find((d) => d.id === dayId) ?? days[0];
  // Only preselect a room the picker offers: an existing session may sit in
  // one that has since been unassigned from the event.
  const [locationId, setLocationId] = useState<string | undefined>(
    locations.find((l) => l.name === prefill?.location)?.id ?? ownRoomsChoice
  );
  const rooms =
    locationId === KEEP_ROOMS
      ? ownRooms
      : locations.filter((l) => l.id === locationId);
  const room = rooms.length === 1 ? rooms[0] : undefined;
  const staysInRooms =
    rooms.length > 0 && rooms.every((r) => ownRooms.includes(r));
  // null while the field follows the room. A capacity the host chose survives
  // a move to another room.
  const [capacityInput, setCapacityInput] = useState<string | null>(
    session &&
      (ownRooms.length > 1 || session.capacity !== (ownRooms[0]?.capacity ?? 0))
      ? String(session.capacity)
      : null
  );
  const capacity = capacityInput ?? String(room?.capacity ?? 0);
  const capacityNumber = Number(capacity);
  const capacityValid =
    capacity.trim() !== "" &&
    Number.isInteger(capacityNumber) &&
    capacityNumber >= 0;
  const overRoomCapacity =
    capacityValid &&
    !!room &&
    room.capacity > 0 &&
    capacityNumber > room.capacity;

  const startTimes = startTimesFor({
    day,
    sessions: snapshot.sessions,
    own: session,
    unavailability: snapshot.unavailability,
    roomIds: rooms.map((r) => r.id),
    staysInRooms,
    event,
  });
  const [startTime, setStartTime] = useState<number | undefined>(
    startTimes.some((st) => st.time === initSlot) ? initSlot : undefined
  );
  const effectiveStartTime = startTimes.some(
    (st) => st.time === startTime && st.available
  )
    ? startTime
    : undefined;
  const chosenStart = lockedStart ?? effectiveStartTime;
  const maxDuration =
    startTimes.find((st) => st.time === chosenStart)?.maxDuration ??
    maxSessionDuration;
  const keepsOwnSlot =
    chosenStart !== undefined && chosenStart === ownSlot && staysInRooms;
  // A proposal's length is free-form, so it snaps to the nearest slot multiple.
  const [duration, setDuration] = useState<number>(
    initialProposal?.durationMinutes
      ? snapDurationToSlots(
          initialProposal.durationMinutes,
          slotIncrementMinutes,
          maxDuration
        )
      : (sessionDuration ??
          snapDurationToSlots(60, slotIncrementMinutes, maxDuration))
  );
  const offeredDurations = gridEndingDurations({
    slotOffsetMinutes:
      chosenStart === undefined
        ? 0
        : minutesPastGrid(chosenStart, day.start, slotIncrementMinutes),
    incrementMinutes: slotIncrementMinutes,
    maxDuration,
    breakMinutes,
  });
  // An organizer may have given the session more than a host may book; dropping
  // that length would move its end unasked.
  const durationChoices =
    keepsOwnSlot &&
    sessionDuration !== null &&
    !offeredDurations.includes(sessionDuration)
      ? [...offeredDurations, sessionDuration].sort((a, b) => a - b)
      : offeredDurations;
  // Derived, so a chosen length comes back when the choices widen again.
  const effectiveDuration = durationChoices.includes(duration)
    ? duration
    : closestAtMost(durationChoices, duration);

  const defaultHosts = [viewer];
  const [hostIds, setHostIds] = useState<string[]>(
    initialProposal
      ? initialProposal.hosts.map((h) => h.id)
      : session
        ? session.hostIds
        : defaultHosts
  );
  const people = useMemo(() => {
    const byId = new Map<string, string>();
    for (const g of snapshot.guests)
      if (g.member || hostIds.includes(g.id)) byId.set(g.id, g.name);
    return [...byId].map(([id, name]) => ({ id, name }));
  }, [snapshot.guests, hostIds]);

  const [confirming, setConfirming] = useState(false);
  const [last, setLast] = useState<"save" | "remove">("save");
  const [checkingFields, setChecking] = useState(false);

  const applyProposal = (next: typeof proposal) => {
    setProposal(next);
    if (next) {
      setTitle(next.title);
      setDescription(next.description ?? "");
      setHostIds(next.hosts.map((h) => h.id));
      if (next.durationMinutes)
        setDuration(
          snapDurationToSlots(
            next.durationMinutes,
            slotIncrementMinutes,
            maxDuration
          )
        );
      setUsedProposal(true);
    } else if (usedProposal) {
      setTitle("");
      setDescription("");
      setHostIds(defaultHosts);
    }
  };

  const interval =
    chosenStart === undefined
      ? null
      : buildSessionInterval(new Date(chosenStart), effectiveDuration);
  const runsFrom = interval && new Date(interval.start.getTime() + breakMs);
  const { clashes, checking: checkingClashes } = useHostClashes(
    actions.hostClashes,
    {
      eventId: event.id,
      guestIds: hostIds,
      start: runsFrom?.getTime(),
      end: interval?.end.getTime(),
      excludeSessionId: session?.id,
    }
  );

  const save = useFormMutation({
    call: (key) =>
      session
        ? actions.update(session.id, body.current as SessionUpdateBody, key)
        : actions.create(body.current as SessionCreateBody, key),
    fieldNames: FIELD_NAMES,
  });
  const remove = useFormMutation({
    call: (key) => actions.remove(session!.id, key),
  });

  const common = {
    dayId: day?.id ?? "",
    title,
    description,
    closed,
    hostIds,
    startTime: new Date(chosenStart ?? 0).toISOString(),
    durationMinutes: effectiveDuration,
    capacity: capacityNumber,
    proposalId: proposal?.id ?? session?.proposalId ?? undefined,
  };
  const next = session
    ? {
        ...common,
        locationIds: rooms.map((r) => r.id),
        expectedVersion: loadedVersion!,
      }
    : { ...common, locationId: rooms[0]?.id ?? "" };
  const invalid = validateFields(
    session ? sessionUpdateSchema : sessionCreateSchema,
    next
  );
  const clientErrors: FieldErrors = checkingFields ? (invalid ?? {}) : {};
  const hasClientErrors = Object.keys(clientErrors).length > 0;
  const fields = hasClientErrors ? clientErrors : save.fields;
  const failure =
    last === "remove" ? remove.error : hasClientErrors ? null : save.error;
  const busy = save.pending || remove.pending;

  const complete =
    !!title &&
    chosenStart !== undefined &&
    hostIds.length > 0 &&
    rooms.length > 0 &&
    capacityValid &&
    !!day &&
    !!effectiveDuration;

  const confirmation = (what: string) =>
    notify({
      tone: "info",
      message: `Your session “${title}” has been ${what}`,
      autoDismissMs: CONFIRMATION_MS,
    });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !complete) return;
    setChecking(!!invalid);
    setLast("save");
    if (invalid) return;
    body.current = next;
    if ((await save.submit())?.ok) {
      confirmation(editing ? "updated successfully!" : "added successfully!");
      onDone();
    }
  };

  const onDelete = async () => {
    setConfirming(false);
    setLast("remove");
    if ((await remove.submit())?.ok) {
      confirmation("deleted successfully.");
      onDone();
    }
  };

  const jump = (name: string) =>
    formRef.current?.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-24">
      <BackLink href={links.schedule}>Schedule</BackLink>
      <div>
        <h2 className="text-2xl font-bold">
          {event.name}: {editing ? "Edit" : "Add a"} session
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          {editing
            ? ""
            : "Fill out this form to add a session to the schedule! "}
          Your session will be added to the schedule immediately, but we may
          reach out to you about rescheduling, relocating, or cancelling.
        </p>
      </div>

      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => void onSubmit(e)}
        className="flex flex-col gap-4"
      >
        {proposals.length > 0 && !editing && (
          <SelectField
            label="Proposal"
            name="proposalId"
            value={proposal?.id ?? ""}
            onChange={(id) =>
              applyProposal(proposals.find((p) => p.id === id) ?? null)
            }
            options={[
              { value: "", label: "[none]" },
              ...proposals.map((p) => ({ value: p.id, label: p.title })),
            ]}
          />
        )}
        {proposal && !editing && (
          <ScheduledSessionsNotice
            proposalId={proposal.id}
            snapshot={snapshot}
            links={links}
          >
            Submitting adds another session. To change a scheduled one, open it
            and edit it there.
          </ScheduledSessionsNotice>
        )}
        <TextField
          label="Session title"
          name="title"
          required
          value={title}
          onChange={setTitle}
          error={fields.title}
        />
        <MarkdownField
          label="Description"
          name="description"
          value={description}
          onChange={setDescription}
          error={fields.description}
        />
        <CheckboxField
          label="Closed session"
          name="closed"
          hint="Check this if attendees can at most arrive 5 minutes late. If they arrive later they may not join and should not knock or otherwise disrupt the session."
          checked={closed}
          onChange={setClosed}
        />
        <PeopleField
          label="Hosts"
          name="hostIds"
          required
          hint="You and any cohosts who have agreed to host this session with you. Your cohosts will get an email confirmation when this form is submitted."
          people={people}
          selected={hostIds}
          error={fields.hostIds}
          onChange={setHostIds}
        />
        <SelectField
          label="Location"
          name="locationId"
          required
          value={locationId ?? ""}
          onChange={setLocationId}
          error={fields.locationId ?? fields.locationIds}
          options={[
            { value: "", label: "Select a location" },
            ...(ownRooms.length > 1
              ? [
                  {
                    value: KEEP_ROOMS,
                    label: ownRooms.map((r) => r.name).join(", "),
                  },
                ]
              : []),
            ...locations.map((l) => ({
              value: l.id,
              label: `${l.name} (max ${l.capacity})`,
            })),
          ]}
        />
        <div className="flex flex-col gap-1">
          <TextField
            label="Max attendees"
            name="capacity"
            type="number"
            hint="Starts at what the room holds. 0 means no limit."
            value={capacity}
            onChange={setCapacityInput}
            error={capacityValid ? fields.capacity : CAPACITY_ERROR}
          />
          {overRoomCapacity && room && (
            <p className="text-sm text-danger-fg">
              That is more than {room.name} holds ({room.capacity}).
            </p>
          )}
        </div>
        {lockedStart !== null && (
          <p className="text-sm text-fg-subtle">
            This session has already started, so it can no longer be moved to
            another time — but you can still change everything else, including
            how long it runs.
          </p>
        )}
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 font-medium">
            Day<span className="mx-1 text-brand-fg">*</span>
          </legend>
          {lockedStart !== null ? (
            <p className="text-fg-muted">{formatDayLabel(day, timezone)}</p>
          ) : (
            <div className="grid gap-3">
              {days.map((d) => (
                <label
                  key={d.id}
                  className="flex items-center gap-3 text-sm font-medium text-fg"
                >
                  <input
                    type="radio"
                    name="dayId"
                    checked={d.id === day.id}
                    onChange={() => setDayId(d.id)}
                    className="h-4 w-4 border-line text-brand focus:ring-brand-accent"
                  />
                  {formatDayLabel(d, timezone)}
                </label>
              ))}
            </div>
          )}
          <FieldError message={fields.dayId} />
        </fieldset>
        {lockedStart !== null ? (
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              Start Time<span className="mx-1 text-brand-fg">*</span>
            </p>
            <p className="text-fg-muted">
              {formatSlotLabel(
                new Date(lockedStart + breakMs),
                day.start,
                timezone
              )}
            </p>
          </div>
        ) : (
          <SelectField
            label="Start Time"
            name="startTime"
            required
            value={
              effectiveStartTime === undefined ? "" : String(effectiveStartTime)
            }
            onChange={(v) => setStartTime(v ? parseInt(v, 10) : undefined)}
            error={fields.startTime}
            options={[
              { value: "", label: "Select a start time" },
              ...startTimes.map((st) => ({
                value: String(st.time),
                label: st.label,
                disabled: !st.available,
              })),
            ]}
          />
        )}
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 font-medium">
            Duration<span className="mx-1 text-brand-fg">*</span>
          </legend>
          <div className="grid gap-3">
            {durationChoices.map((value) => (
              <label
                key={value}
                className="flex items-center gap-3 text-sm font-medium text-fg"
              >
                <input
                  type="radio"
                  name="durationMinutes"
                  checked={value === effectiveDuration}
                  onChange={() => setDuration(value)}
                  className="h-4 w-4 border-line text-brand focus:ring-brand-accent"
                />
                {formatDuration(durationMinusBreak(value, breakMinutes), true)}
              </label>
            ))}
          </div>
          <FieldError message={fields.durationMinutes} />
        </fieldset>
        {runsFrom && interval && (
          <p className="text-sm text-fg-muted">
            Your session runs {formatSlotLabel(runsFrom, day.start, timezone)} –{" "}
            {formatSlotLabel(interval.end, day.start, timezone)}.
          </p>
        )}
        {session?.proposalId && (
          <p className="text-sm text-fg-muted">
            This session was scheduled from a proposal. See it{" "}
            <a
              href={links.proposal(session.proposalId)}
              className="text-brand-fg underline"
            >
              here
            </a>
            .
          </p>
        )}
        {clashes.length > 0 && (
          <div className="rounded-md border border-danger-border bg-danger-tint px-4 py-3 text-danger-fg">
            <p className="text-sm font-medium">Warning: schedule clash</p>
            {clashes.map((clash) => {
              const line = hostClashLine(clash, timezone);
              return (
                <p key={line} className="text-sm font-medium">
                  - {line}
                </p>
              );
            })}
          </div>
        )}

        <FormErrorSummary
          fields={fields}
          error={failure === FIX_FIELDS_MESSAGE ? null : failure}
          onJump={jump}
        />

        <div className="flex flex-wrap-reverse items-center gap-3">
          {editing && (
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => setConfirming(true)}
            >
              Delete
            </Button>
          )}
          <div className="ml-auto flex gap-3">
            <a
              href={links.schedule}
              className="rounded px-6 py-2 font-semibold text-fg-muted bg-surface-muted hover:bg-surface-hover"
            >
              Cancel
            </a>
            <Button
              type="submit"
              disabled={!complete || checkingClashes || busy}
            >
              {save.pending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={confirming}
        title="Delete session?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => void onDelete()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
