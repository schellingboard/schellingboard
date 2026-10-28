import { useId, useState, type FormEvent } from "react";
import type {
  AvailabilityFormData,
  SlotDay,
} from "@schellingboard/domain/meeting-slot-days";
import type { MeetingAvailabilityCalls } from "../../commands/meeting-availability";
import { useFormMutation } from "../../commands/use-form-mutation";
import { Button } from "../../ui/button";

export function AvailabilityForm({
  eventId,
  eventName,
  timezone,
  days,
  declared,
  calls,
}: AvailabilityFormData & { calls: MeetingAvailabilityCalls }) {
  const switchId = useId();
  // No rows means not bookable, so the switch is "did you declare anything".
  const [open, setOpen] = useState(declared.length > 0);
  const [selected, setSelected] = useState<Set<string>>(new Set(declared));
  const [saved, setSaved] = useState(false);

  const allSlots = days.flatMap((day) => day.slots.map((s) => s.start));
  // Saving this would store nothing, and nothing reads back as "not open".
  const emptyWhileOpen = open && selected.size === 0;

  const mutation = useFormMutation({
    call: (key) =>
      calls.save(
        // Switched off clears the declaration rather than hiding it.
        { eventId, slotStarts: open ? [...selected] : [] },
        key
      ),
  });

  const change = (next: Set<string>) => {
    setSaved(false);
    setSelected(next);
  };

  const toggleOpen = (checked: boolean) => {
    setSaved(false);
    setOpen(checked);
    if (checked && selected.size === 0) setSelected(new Set(allSlots));
  };

  const toggleSlot = (start: string) => {
    const next = new Set(selected);
    if (next.has(start)) next.delete(start);
    else next.add(start);
    change(next);
  };

  const setDay = (day: SlotDay, on: boolean) => {
    const next = new Set(selected);
    for (const slot of day.slots) {
      if (on) next.add(slot.start);
      else next.delete(slot.start);
    }
    change(next);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await mutation.submit();
    setSaved(result?.ok === true);
  };

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      aria-label={`1-on-1s at ${eventName}`}
      className="flex flex-col gap-4"
    >
      {mutation.error && (
        <p role="alert" className="text-sm text-danger-fg">
          {mutation.error}
        </p>
      )}

      <div className="rounded-md border border-line-subtle p-4">
        <div className="flex items-start gap-2">
          <input
            id={switchId}
            type="checkbox"
            checked={open}
            onChange={(e) => toggleOpen(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line text-brand-fg focus:ring-brand-accent"
          />
          <div>
            <label htmlFor={switchId} className="font-medium text-fg">
              I&apos;m open to 1-on-1s at this event
            </label>
            <p className="text-sm text-fg-subtle">
              While this is off, nobody can book you and you won&apos;t appear
              as bookable.
            </p>
          </div>
        </div>
      </div>

      {open && (
        <>
          <p className="rounded-md bg-surface-sunken p-3 text-sm text-fg-subtle">
            Clear the slots you want kept free. You don&apos;t need to clear the
            ones where you&apos;re hosting or have RSVP&apos;d to — anyone
            booking you is warned about those. Times are in the event timezone (
            {timezone}).
          </p>

          {days.length === 0 && (
            <p className="text-fg-muted">
              The organizer hasn&apos;t set up any days with 1-on-1 slots yet.
            </p>
          )}

          {days.map((day) => (
            <section key={day.id} aria-label={day.label}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-fg">{day.label}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="quiet"
                    className="bg-surface-muted"
                    onClick={() => setDay(day, true)}
                    aria-label={`Select all slots on ${day.label}`}
                  >
                    Select all
                  </Button>
                  <Button
                    variant="quiet"
                    className="bg-surface-muted"
                    onClick={() => setDay(day, false)}
                    aria-label={`Clear all slots on ${day.label}`}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <ul className="divide-y divide-line-subtle border-t border-line-subtle">
                {day.slots.map((slot) => (
                  <li key={slot.start}>
                    <label className="flex cursor-pointer items-center gap-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(slot.start)}
                        onChange={() => toggleSlot(slot.start)}
                        className="h-4 w-4 rounded border-line text-brand-fg focus:ring-brand-accent"
                      />
                      <span className="text-fg">{slot.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      <div className="flex items-center justify-end gap-3">
        {emptyWhileOpen && (
          <span className="text-sm text-fg-subtle">
            Clearing every slot is the same as switching this off.
          </span>
        )}
        {saved && <span className="text-sm text-success-fg">Saved!</span>}
        <Button type="submit" disabled={mutation.pending || emptyWhileOpen}>
          {mutation.pending ? "Saving..." : "Save availability"}
        </Button>
      </div>
    </form>
  );
}
