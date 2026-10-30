import { useMemo, useState } from "react";
import {
  utcToZonedInput,
  zonedInputToInstant,
} from "@schellingboard/domain/admin-datetime";
import { isEventIconName } from "@schellingboard/domain/event-icons";
import { SLOT_INCREMENT_OPTIONS } from "@schellingboard/domain/slots";
import type { AdminEventCalls } from "../../commands/admin-events";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminEvent } from "../../queries/admin-events";
import { Button } from "../../ui/button";
import {
  CheckboxField,
  DateTimeField,
  MarkdownField,
  SelectField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import type { AdminEventDay } from "../../queries/admin-event";
import type { MeetingPoint } from "../../queries/admin-meeting-points";
import type { ScheduledSession } from "../../queries/admin-scheduled-sessions";
import { EventDaysManager } from "./event-days";
import { EventMeetingsForm } from "./event-meetings";
import { EventIconPicker } from "./event-icon-picker";
import { timezones } from "./timezones";
import { useEventSection } from "./use-event-section";
import { jumpTo, useSectionSave } from "./use-section-save";

function SaveRow({
  pending,
  saved,
  label,
}: {
  pending: boolean;
  saved: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : label}
      </Button>
      {saved && <span className="text-sm text-success-fg">Saved!</span>}
    </div>
  );
}

const DETAIL_FIELDS = [
  "name",
  "description",
  "website",
  "timezone",
  "maxSessionDuration",
  "breakMinutes",
  "slotIncrementMinutes",
  "icon",
];

const detailsOf = (event: AdminEvent) => ({
  name: event.name,
  description: event.description,
  website: event.website,
  timezone: event.timezone,
  maxSessionDuration: String(event.maxSessionDuration),
  breakMinutes: String(event.breakMinutes),
  slotIncrementMinutes: String(event.slotIncrementMinutes),
  rsvpCapacityHardLimit: event.rsvpCapacityHardLimit,
  icon: event.icon && isEventIconName(event.icon) ? event.icon : "",
});

type Details = ReturnType<typeof detailsOf>;

function DetailsForm({
  event,
  calls,
  onChanged,
}: {
  event: AdminEvent;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const { form, setForm, version, markSaved } = useEventSection(
    detailsOf(event),
    event.version
  );
  const zones = useMemo(() => timezones(), []);
  const body = {
    ...form,
    maxSessionDuration: Number(form.maxSessionDuration),
    breakMinutes: Number(form.breakMinutes),
    slotIncrementMinutes: Number(form.slotIncrementMinutes),
    icon: isEventIconName(form.icon) ? form.icon : null,
  };
  const section = useSectionSave({
    call: (key) => calls.update(event.id, body, version, key),
    fieldNames: DETAIL_FIELDS,
    onSaved: () => markSaved(form),
    onChanged,
  });
  const set =
    <K extends keyof Details>(key: K) =>
    (value: Details[K]) => {
      section.clearSaved();
      setForm((prev) => ({ ...prev, [key]: value }));
    };
  const { fields } = section;

  return (
    <form
      onSubmit={(e) => void section.save(e)}
      noValidate
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold text-fg">Basic info</h2>
      <TextField
        label="Name"
        name="name"
        required
        value={form.name}
        onChange={set("name")}
        error={fields.name}
      />
      <MarkdownField
        label="Description"
        name="description"
        value={form.description}
        onChange={set("description")}
        error={fields.description}
      />
      <TextField
        label="Website"
        name="website"
        value={form.website}
        onChange={set("website")}
        error={fields.website}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SelectField
          label="Timezone"
          name="timezone"
          required
          value={form.timezone}
          onChange={set("timezone")}
          options={zones.map((tz) => ({ value: tz, label: tz }))}
          error={fields.timezone}
        />
        <TextField
          label="Max session duration (min)"
          name="maxSessionDuration"
          type="number"
          min={1}
          required
          value={form.maxSessionDuration}
          onChange={set("maxSessionDuration")}
          error={fields.maxSessionDuration}
        />
        <TextField
          label="Break before each session (min)"
          name="breakMinutes"
          type="number"
          min={0}
          required
          hint="Applies to sessions booked from now on."
          value={form.breakMinutes}
          onChange={set("breakMinutes")}
          error={fields.breakMinutes}
        />
        <SelectField
          label="Schedule increment (min)"
          name="slotIncrementMinutes"
          value={form.slotIncrementMinutes}
          onChange={set("slotIncrementMinutes")}
          options={SLOT_INCREMENT_OPTIONS.map((o) => ({
            value: String(o),
            label: String(o),
          }))}
          error={fields.slotIncrementMinutes}
        />
      </div>
      <CheckboxField
        label="Enforce session capacity as a hard limit — reject RSVPs once a session is full (capacity 0 means unlimited)"
        name="rsvpCapacityHardLimit"
        checked={form.rsvpCapacityHardLimit}
        onChange={set("rsvpCapacityHardLimit")}
      />
      <div className="flex flex-col gap-1">
        <span className="font-medium">Icon</span>
        <EventIconPicker
          label="Icon"
          value={form.icon}
          onChange={set("icon")}
        />
      </div>
      <FormErrorSummary fields={fields} error={section.error} onJump={jumpTo} />
      <SaveRow
        pending={section.pending}
        saved={section.saved}
        label="Save changes"
      />
    </form>
  );
}

const PHASES = [
  {
    label: "Proposal phase",
    start: "proposalPhaseStart",
    end: "proposalPhaseEnd",
  },
  { label: "Voting phase", start: "votingPhaseStart", end: "votingPhaseEnd" },
  {
    label: "Scheduling phase",
    start: "schedulingPhaseStart",
    end: "schedulingPhaseEnd",
  },
] as const;

type PhaseKey = (typeof PHASES)[number]["start" | "end"];

const PHASE_KEYS = PHASES.flatMap((p) => [p.start, p.end]);

function PhasesForm({
  event,
  calls,
  onChanged,
}: {
  event: AdminEvent;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const { form, setForm, version, markSaved } = useEventSection(
    Object.fromEntries(
      PHASE_KEYS.map((k) => [k, utcToZonedInput(event[k], event.timezone)])
    ) as Record<PhaseKey, string>,
    event.version
  );
  const body = Object.fromEntries(
    PHASE_KEYS.map((k) => [k, zonedInputToInstant(form[k], event.timezone)])
  ) as Record<PhaseKey, string | null>;
  const section = useSectionSave({
    call: (key) => calls.updatePhases(event.id, body, version, key),
    fieldNames: PHASE_KEYS,
    onSaved: () => markSaved(form),
    onChanged,
  });
  const set = (key: PhaseKey) => (value: string) => {
    section.clearSaved();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => void section.save(e)}
      noValidate
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold text-fg">Phases</h2>
      <p className="text-sm text-fg-subtle">
        All times are in the event timezone ({event.timezone}). Leave fields
        empty to unset a phase. A phase with no end runs until the next phase
        starts; set an end earlier than the next start to leave an inactive gap.
      </p>
      {PHASES.map(({ label, start, end }) => (
        <fieldset key={label}>
          <legend className="text-sm font-medium text-fg-muted">{label}</legend>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DateTimeField
              label="Start"
              name={start}
              kind="datetime-local"
              value={form[start]}
              onChange={set(start)}
              error={section.fields[start]}
            />
            <DateTimeField
              label="End"
              name={end}
              kind="datetime-local"
              value={form[end]}
              onChange={set(end)}
              error={section.fields[end]}
            />
          </div>
        </fieldset>
      ))}
      <FormErrorSummary
        fields={section.fields}
        error={section.error}
        onJump={jumpTo}
      />
      <SaveRow
        pending={section.pending}
        saved={section.saved}
        label="Save phases"
      />
    </form>
  );
}

function DangerZone({
  event,
  calls,
  onDeleted,
}: {
  event: AdminEvent;
  calls: AdminEventCalls;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const mutation = useFormMutation({
    call: (key) => calls.remove(event.id, key),
    explainRefusals: true,
  });

  const close = () => {
    setConfirming(false);
    setTyped("");
    mutation.reset();
  };
  const remove = async () => {
    if ((await mutation.submit())?.ok) onDeleted();
  };

  return (
    <section
      aria-label="Danger zone"
      className="space-y-3 border-t border-danger-border pt-6"
    >
      <h2 className="text-lg font-semibold text-danger-fg">Danger zone</h2>
      {!confirming ? (
        <Button variant="danger" onClick={() => setConfirming(true)}>
          Delete event
        </Button>
      ) : (
        <div className="space-y-3 rounded-md border border-danger-border p-4">
          <p className="text-sm text-danger-fg">
            This will permanently delete the event and all associated days,
            proposals, sessions, RSVPs, and assignments.
          </p>
          <TextField
            label="Type the event name to confirm"
            placeholder={event.name}
            value={typed}
            onChange={setTyped}
          />
          <FormErrorSummary
            fields={{}}
            error={mutation.error}
            onJump={jumpTo}
          />
          <div className="flex gap-2">
            <Button
              variant="danger"
              disabled={mutation.pending || typed !== event.name}
              onClick={() => void remove()}
            >
              {mutation.pending ? "Deleting..." : "Confirm delete"}
            </Button>
            <Button variant="quiet" disabled={mutation.pending} onClick={close}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export function EventConfigTab({
  event,
  days,
  points,
  sessions,
  calls,
  onChanged,
  onPointsChanged,
  onDeleted,
}: {
  event: AdminEvent;
  days: AdminEventDay[];
  points: MeetingPoint[];
  sessions: ScheduledSession[];
  calls: AdminEventCalls;
  /** The event, its days and its sessions are out of date: load them again. */
  onChanged: () => void;
  onPointsChanged: () => void;
  onDeleted: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-8">
        <DetailsForm event={event} calls={calls} onChanged={onChanged} />
        <DangerZone event={event} calls={calls} onDeleted={onDeleted} />
      </div>
      <hr className="border-line-subtle" />
      <div className="max-w-3xl">
        <PhasesForm event={event} calls={calls} onChanged={onChanged} />
      </div>
      <hr className="border-line-subtle" />
      <div className="max-w-3xl">
        <EventMeetingsForm
          event={event}
          points={points}
          calls={calls}
          onChanged={onChanged}
          onPointsChanged={onPointsChanged}
        />
      </div>
      <hr className="border-line-subtle" />
      <EventDaysManager
        eventId={event.id}
        timezone={event.timezone}
        days={days}
        sessions={sessions}
        calls={calls}
        onChanged={onChanged}
      />
    </div>
  );
}
