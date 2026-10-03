"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";
import { Input } from "@/app/input";
import {
  addLocationUnavailabilityAction,
  deleteLocationUnavailabilityAction,
} from "@/app/actions/admin-location-unavailability";
import {
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  DANGER_BUTTON,
} from "@/app/admin/buttons";
import { ActionError } from "@/app/components/action-error";
import { RoomCheckboxes } from "@/app/admin/room-checkboxes";
import { utcToZonedInput, zonedInputToUtc } from "@/utils/admin-datetime";

export type SerializedUnavailability = {
  id: string;
  locationId: string;
  start: string;
  end: string;
};

type Room = { id: string; name: string };
type DayWindow = { id: string; start: string; end: string };

function formatIn(iso: string, timezone: string, format: string): string {
  return DateTime.fromISO(iso, { zone: "utc" })
    .setZone(timezone)
    .toFormat(format);
}

function PeriodRow({
  period,
  roomName,
  timezone,
}: {
  period: SerializedUnavailability;
  roomName: string;
  timezone: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const label = `${formatIn(period.start, timezone, "ccc d LLL HH:mm")} – ${formatIn(
    period.end,
    timezone,
    "ccc d LLL HH:mm"
  )}`;

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await deleteLocationUnavailabilityAction({
          id: period.id,
        });
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

  return (
    <li className="py-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          <span className="font-medium text-fg">{roomName}</span> · {label}
        </p>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={DANGER_BUTTON}
          aria-label={`Delete unavailable time ${roomName} ${label}`}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      <ActionError message={error} />
    </li>
  );
}

function AddPeriodForm({
  eventId,
  rooms,
  days,
  timezone,
}: {
  eventId: string;
  rooms: Room[];
  days: DayWindow[];
  timezone: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await addLocationUnavailabilityAction({
          eventId,
          locationIds,
          start: zonedInputToUtc(start, timezone),
          end: zonedInputToUtc(end, timezone),
        });
        if (!result.ok) {
          setError(result.error);
        } else {
          setError(null);
          setStart("");
          setEnd("");
          router.refresh();
        }
      } catch {
        setError("Request failed");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border border-line-subtle rounded-md p-4"
    >
      <RoomCheckboxes
        legend="Locations"
        rooms={rooms}
        selectedIds={locationIds}
        onChange={setLocationIds}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="unavailable-start" className="text-sm text-fg-muted">
            From *
          </label>
          <Input
            id="unavailable-start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
            className="w-full h-10"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="unavailable-end" className="text-sm text-fg-muted">
            Until *
          </label>
          <Input
            id="unavailable-end"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            className="w-full h-10"
          />
        </div>
      </div>
      {days.length > 0 && (
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Fill in a whole day</legend>
          <span aria-hidden className="text-sm text-fg-muted">
            Whole day:
          </span>
          {days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => {
                setStart(utcToZonedInput(day.start, timezone));
                setEnd(utcToZonedInput(day.end, timezone));
              }}
              className={SECONDARY_BUTTON}
            >
              {formatIn(day.start, timezone, "ccc d LLL")}
            </button>
          ))}
        </fieldset>
      )}
      <ActionError message={error} />
      <button
        type="submit"
        disabled={isPending || locationIds.length === 0}
        className={PRIMARY_BUTTON}
      >
        {isPending ? "Adding..." : "Add unavailable time"}
      </button>
    </form>
  );
}

export function LocationAvailabilityManager({
  eventId,
  periods,
  rooms,
  days,
  timezone,
}: {
  eventId: string;
  periods: SerializedUnavailability[];
  rooms: Room[];
  days: DayWindow[];
  timezone: string;
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
        />
      )}
    </section>
  );
}
