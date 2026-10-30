import { useState, type FormEvent } from "react";
import { DateTime } from "luxon";
import {
  utcToZonedInput,
  zonedInputToInstant,
} from "@schellingboard/domain/admin-datetime";
import type { AdminEventCalls } from "../../commands/admin-events";
import type { FieldErrors } from "../../commands/mutation";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { Unavailability } from "../../queries/admin-unavailability";
import { Button } from "../../ui/button";
import { DateTimeField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { RoomCheckboxes } from "./room-checkboxes";
import { shown, useJumpWithin } from "./use-section-save";

type Room = { id: string; name: string };
type DayWindow = { id: string; start: string; end: string };

const formatIn = (iso: string, timezone: string, format: string) =>
  DateTime.fromISO(iso, { zone: "utc" }).setZone(timezone).toFormat(format);

function PeriodRow({
  period,
  roomName,
  timezone,
  calls,
  onChanged,
}: {
  period: Unavailability;
  roomName: string;
  timezone: string;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const mutation = useFormMutation({
    call: (key) => calls.deleteUnavailability(period.id, key),
    explainRefusals: true,
  });
  const range = `${formatIn(period.start, timezone, "ccc d LLL HH:mm")} – ${formatIn(
    period.end,
    timezone,
    "ccc d LLL HH:mm"
  )}`;
  const remove = async () => {
    if ((await mutation.submit())?.ok) onChanged();
  };
  return (
    <li className="space-y-2 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          <span className="font-medium text-fg">{roomName}</span> · {range}
        </p>
        <Button
          variant="danger"
          disabled={mutation.pending}
          aria-label={`Delete unavailable time ${roomName} ${range}`}
          onClick={() => void remove()}
        >
          {mutation.pending ? "Deleting..." : "Delete"}
        </Button>
      </div>
      <FormErrorSummary
        fields={{}}
        error={shown(mutation.error)}
        onJump={() => {}}
      />
    </li>
  );
}

function AddPeriodForm({
  eventId,
  rooms,
  days,
  timezone,
  calls,
  onChanged,
}: {
  eventId: string;
  rooms: Room[];
  days: DayWindow[];
  timezone: string;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [checking, setChecking] = useState(false);
  const startAt = zonedInputToInstant(start, timezone);
  const endAt = zonedInputToInstant(end, timezone);
  const mutation = useFormMutation({
    call: (key) =>
      calls.addUnavailability(
        eventId,
        { locationIds, start: startAt as string, end: endAt as string },
        key
      ),
    fieldNames: ["start", "end"],
    explainRefusals: true,
  });
  const missing: FieldErrors = {};
  if (!startAt) missing.start = "From is required";
  if (!endAt) missing.end = "Until is required";
  const errors = { ...(checking ? missing : {}), ...mutation.fields };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (!startAt || !endAt) return;
    const result = await mutation.submit();
    if (result?.ok) {
      setChecking(false);
      setStart("");
      setEnd("");
      onChanged();
    }
  };

  return (
    <form
      ref={ref}
      noValidate
      onSubmit={(e) => void submit(e)}
      className="space-y-3 rounded-md border border-line-subtle p-4"
    >
      <RoomCheckboxes
        legend="Locations"
        rooms={rooms}
        selectedIds={locationIds}
        onChange={setLocationIds}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DateTimeField
          label="From"
          name="start"
          kind="datetime-local"
          required
          value={start}
          onChange={setStart}
          error={errors.start}
        />
        <DateTimeField
          label="Until"
          name="end"
          kind="datetime-local"
          required
          value={end}
          onChange={setEnd}
          error={errors.end}
        />
      </div>
      {days.length > 0 && (
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Fill in a whole day</legend>
          <span aria-hidden className="text-sm text-fg-muted">
            Whole day:
          </span>
          {days.map((day) => (
            <Button
              key={day.id}
              variant="quiet"
              className="border border-line"
              onClick={() => {
                setStart(utcToZonedInput(day.start, timezone));
                setEnd(utcToZonedInput(day.end, timezone));
              }}
            >
              {formatIn(day.start, timezone, "ccc d LLL")}
            </Button>
          ))}
        </fieldset>
      )}
      <FormErrorSummary
        fields={errors}
        error={shown(mutation.error)}
        onJump={jump}
      />
      <Button
        type="submit"
        disabled={mutation.pending || locationIds.length === 0}
      >
        {mutation.pending ? "Adding..." : "Add unavailable time"}
      </Button>
    </form>
  );
}

export function LocationAvailabilityManager({
  eventId,
  periods,
  rooms,
  days,
  timezone,
  calls,
  onChanged,
}: {
  eventId: string;
  periods: Unavailability[];
  rooms: Room[];
  days: DayWindow[];
  timezone: string;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
  return (
    <section aria-label="Location unavailability" className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">Location unavailability</h2>
      <p className="text-sm text-fg-subtle">
        Times a location can&apos;t be booked, such as a location only open on
        one day. Attendees simply aren&apos;t offered those slots. For something
        they should see on the schedule, such as lunch, add a blocker session
        instead. All times are in the event timezone ({timezone}).
      </p>
      {periods.length > 0 && (
        <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
          {periods.map((period) => (
            <PeriodRow
              key={period.id}
              period={period}
              roomName={
                roomNames.get(period.locationId) ?? "Unassigned location"
              }
              timezone={timezone}
              calls={calls}
              onChanged={onChanged}
            />
          ))}
        </ul>
      )}
      {rooms.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Assign a location to the event first.
        </p>
      ) : (
        <AddPeriodForm
          eventId={eventId}
          rooms={rooms}
          days={days}
          timezone={timezone}
          calls={calls}
          onChanged={onChanged}
        />
      )}
    </section>
  );
}
