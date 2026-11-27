import { i18n } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  utcToZonedInput,
  zonedInputToInstant,
} from "@schellingboard/domain/admin-datetime";
import type { IdentityMode } from "@schellingboard/domain/event";
import { isEventIconName } from "@schellingboard/domain/event-icons";
import { SLOT_INCREMENT_OPTIONS } from "@schellingboard/domain/slots";
import { useMemo, useState } from "react";

import type { AdminEventCalls } from "../../commands/admin-events";
import type {
  AdminEventDay,
  AdminEventMoment,
} from "../../queries/admin-event";
import type { AdminEvent } from "../../queries/admin-events";
import type { MeetingPoint } from "../../queries/admin-meeting-points";
import type { ScheduledSession } from "../../queries/admin-sessions";
import { Button } from "../../ui/button";
import {
  CheckboxField,
  ComboboxField,
  DateTimeField,
  MarkdownField,
  SelectField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import {
  defaultProposalHelp,
  proposalHelpOf,
} from "../proposals/default-proposal-help";
import { ConfirmByTyping } from "./confirm-by-typing";
import { EventDaysManager } from "./event-days";
import { EventIconPicker } from "./event-icon-picker";
import { EventMeetingsForm } from "./event-meetings";
import { EventMomentsManager } from "./event-moments";
import { identityModeHint, identityModeOptions } from "./identity-mode-options";
import { matchingZones, timezones } from "./timezones";
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
        {pending ? t`Saving...` : label}
      </Button>
      {saved && (
        <span className="text-sm text-success-fg">
          <Trans>Saved!</Trans>
        </span>
      )}
    </div>
  );
}

const detailsOf = (event: AdminEvent) => ({
  name: event.name,
  description: event.description,
  website: event.website,
  proposalHelp: proposalHelpOf(event),
  timezone: event.timezone,
  maxSessionDuration: String(event.maxSessionDuration),
  breakMinutes: String(event.breakMinutes),
  slotIncrementMinutes: String(event.slotIncrementMinutes),
  rsvpCapacityHardLimit: event.rsvpCapacityHardLimit,
  identityMode: event.identityMode,
  proxyJoins: event.proxyJoins,
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
    proposalHelp:
      form.proposalHelp.trim() === defaultProposalHelp()
        ? ""
        : form.proposalHelp,
  };
  const section = useSectionSave({
    call: (key) => calls.update(event.id, body, version, key),
    fieldNames: [
      "name",
      "description",
      "website",
      "proposalHelp",
      "timezone",
      "maxSessionDuration",
      "breakMinutes",
      "slotIncrementMinutes",
      "icon",
      "identityMode",
    ],
    onSaved: () => markSaved(form),
    onChanged,
  });
  const setField =
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
      <h2 className="text-lg font-semibold text-fg">
        <Trans>Basic info</Trans>
      </h2>
      <TextField
        label={t`Name`}
        name="name"
        required
        value={form.name}
        onChange={setField("name")}
        error={fields.name}
      />
      <MarkdownField
        label={t`Description`}
        name="description"
        value={form.description}
        onChange={setField("description")}
        error={fields.description}
      />
      <TextField
        label={t`Website`}
        name="website"
        value={form.website}
        onChange={setField("website")}
        error={fields.website}
      />
      <div className="space-y-2">
        <MarkdownField
          label={t`Help for proposers`}
          name="proposalHelp"
          hint={t`Opens from the Need ideas? button. Markdown supported.`}
          value={form.proposalHelp}
          onChange={setField("proposalHelp")}
          error={fields.proposalHelp}
        />
        <Button
          type="button"
          variant="quiet"
          onClick={() => setField("proposalHelp")(defaultProposalHelp())}
        >
          <Trans>Reset to default</Trans>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ComboboxField
          label={t`Timezone`}
          name="timezone"
          required
          strict
          value={form.timezone}
          onChange={setField("timezone")}
          options={matchingZones(zones, form.timezone)}
          error={fields.timezone}
        />
        <TextField
          label={t`Max session duration (min)`}
          name="maxSessionDuration"
          type="number"
          min={1}
          required
          value={form.maxSessionDuration}
          onChange={setField("maxSessionDuration")}
          error={fields.maxSessionDuration}
        />
        <TextField
          label={t`Break before each session (min)`}
          name="breakMinutes"
          type="number"
          min={0}
          required
          hint={t`Applies to sessions booked from now on.`}
          value={form.breakMinutes}
          onChange={setField("breakMinutes")}
          error={fields.breakMinutes}
        />
        <SelectField
          label={t`Schedule increment (min)`}
          name="slotIncrementMinutes"
          value={form.slotIncrementMinutes}
          onChange={setField("slotIncrementMinutes")}
          options={SLOT_INCREMENT_OPTIONS.map((o) => ({
            value: String(o),
            label: String(o),
          }))}
          error={fields.slotIncrementMinutes}
        />
      </div>
      <SelectField
        label={t`Identity`}
        name="identityMode"
        value={form.identityMode}
        onChange={(v) => setField("identityMode")(v as IdentityMode)}
        options={identityModeOptions()}
        hint={identityModeHint()}
        error={fields.identityMode}
      />
      <CheckboxField
        label={t`Enforce session capacity as a hard limit — reject RSVPs once a session is full (capacity 0 means unlimited)`}
        name="rsvpCapacityHardLimit"
        checked={form.rsvpCapacityHardLimit}
        onChange={setField("rsvpCapacityHardLimit")}
      />
      <CheckboxField
        label={t`People who sign in through the proxy join this event`}
        name="proxyJoins"
        checked={form.proxyJoins}
        onChange={setField("proxyJoins")}
      />
      <div className="flex flex-col gap-1">
        <span className="font-medium">
          <Trans>Icon</Trans>
        </span>
        <EventIconPicker
          label={t`Icon`}
          value={form.icon}
          onChange={setField("icon")}
        />
      </div>
      <FormErrorSummary fields={fields} error={section.error} onJump={jumpTo} />
      <SaveRow
        pending={section.pending}
        saved={section.saved}
        label={t`Save changes`}
      />
    </form>
  );
}

const PHASES = [
  {
    label: msg`Proposal phase`,
    start: "proposalPhaseStart",
    end: "proposalPhaseEnd",
  },
  {
    label: msg`Voting phase`,
    start: "votingPhaseStart",
    end: "votingPhaseEnd",
  },
  {
    label: msg`Scheduling phase`,
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
  const timezone = event.timezone;
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
  const setField = (key: PhaseKey) => (value: string) => {
    section.clearSaved();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => void section.save(e)}
      noValidate
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold text-fg">
        <Trans>Phases</Trans>
      </h2>
      <p className="text-sm text-fg-subtle">
        <Trans>
          All times are in the event timezone ({timezone}). Leave fields empty
          to unset a phase. A phase with no end runs until the next phase
          starts; set an end earlier than the next start to leave an inactive
          gap.
        </Trans>
      </p>
      {PHASES.map(({ label, start, end }) => (
        <fieldset key={start}>
          <legend className="text-sm font-medium text-fg-muted">
            {i18n._(label)}
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DateTimeField
              label={t({
                message: "Start",
                context: "Date field: when it begins",
              })}
              name={start}
              kind="datetime-local"
              value={form[start]}
              onChange={setField(start)}
              error={section.fields[start]}
            />
            <DateTimeField
              label={t({ message: "End", context: "Date field: when it ends" })}
              name={end}
              kind="datetime-local"
              value={form[end]}
              onChange={setField(end)}
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
        label={t`Save phases`}
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

  return (
    <section
      aria-label={t`Danger zone`}
      className="space-y-3 border-t border-danger-border pt-6"
    >
      <h2 className="text-lg font-semibold text-danger-fg">
        <Trans>Danger zone</Trans>
      </h2>
      {!confirming ? (
        <Button variant="danger" onClick={() => setConfirming(true)}>
          <Trans>Delete event</Trans>
        </Button>
      ) : (
        <div className="rounded-md border border-danger-border p-4">
          <ConfirmByTyping
            label={t`Type the event name to confirm`}
            expected={event.name}
            warning={t`This will permanently delete the event and all associated days, proposals, sessions, RSVPs, and assignments. No one is notified.`}
            call={(key) => calls.remove(event.id, key)}
            onDeleted={onDeleted}
            onCancel={() => setConfirming(false)}
          />
        </div>
      )}
    </section>
  );
}

export function EventConfigTab({
  event,
  days,
  moments,
  points,
  sessions,
  calls,
  onChanged,
  onPointsChanged,
  onDeleted,
}: {
  event: AdminEvent;
  days: AdminEventDay[];
  moments: AdminEventMoment[];
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
        moments={moments}
        sessions={sessions}
        calls={calls}
        onChanged={onChanged}
      />
      <hr className="border-line-subtle" />
      <EventMomentsManager
        eventId={event.id}
        timezone={event.timezone}
        days={days}
        moments={moments}
        calls={calls}
        onChanged={onChanged}
      />
    </div>
  );
}
