import { useState, type FormEvent } from "react";
import { clashLines } from "@schellingboard/domain/meeting-clash-text";
import type { MeetingRequestCalls } from "../../commands/meeting-request";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { ProfileMeetingOption } from "../../queries/profile-activity";
import { Dialog } from "../../ui/dialog";
import {
  MeetingClashNotice,
  MeetingLengthChips,
  MeetingRequestError,
  MeetingRequestFields,
  MeetingRequestSent,
} from "../meetings/meeting-request-fields";

type Day = ProfileMeetingOption["lengths"][number]["days"][number];

function SlotList({
  days,
  selected,
  onSelect,
}: {
  days: Day[];
  selected: string | null;
  onSelect: (start: string) => void;
}) {
  return (
    <>
      {days.map((day) => (
        <section key={day.label} aria-label={day.label} className="mb-4">
          <h3 className="mb-1 text-sm font-semibold text-fg">{day.label}</h3>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {day.slots.map((slot) => {
              const unavailable = slot.state === "unavailable";
              const isSelected = selected === slot.start;
              return (
                <li key={slot.start}>
                  <button
                    type="button"
                    disabled={unavailable}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(slot.start)}
                    className={`flex h-full min-h-12 w-full flex-col items-center justify-center rounded-md border px-1 py-1 text-sm tabular-nums transition-colors ${
                      isSelected
                        ? "border-brand bg-brand text-on-brand"
                        : unavailable
                          ? "cursor-not-allowed border-line-subtle bg-surface-sunken text-fg-subtle"
                          : slot.state === "busy"
                            ? "border-warning bg-warning-tint text-fg hover:bg-surface-hover"
                            : "border-line bg-surface-raised text-fg hover:bg-surface-hover"
                    }`}
                  >
                    <span className="whitespace-nowrap">{slot.label}</span>
                    {unavailable && (
                      <span className="block text-xs">Unavailable</span>
                    )}
                    {slot.state === "busy" && (
                      <span className="block text-xs">Busy</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}

/** "Schedule a 1-on-1" from a profile: pick a length and a slot, then ask. */
export function MeetingRequestDialog({
  option,
  recipientId,
  recipientName,
  actions,
  onClose,
}: {
  option: ProfileMeetingOption;
  recipientId: string;
  recipientName: string;
  actions: MeetingRequestCalls;
  onClose: () => void;
}) {
  const [slotCount, setSlotCount] = useState(1);
  const [slotStart, setSlotStart] = useState<string | null>(null);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = useFormMutation({
    fieldNames: ["meetingPoint", "message"],
    call: (key) =>
      actions.request(
        {
          eventId: option.eventId,
          recipientId,
          slotStart: slotStart!,
          slotCount,
          meetingPoint,
          message,
        },
        key
      ),
  });

  const days =
    option.lengths.find((l) => l.slotCount === slotCount)?.days ?? [];
  const day = days.find((d) => d.slots.some((s) => s.start === slotStart));
  const slot = day?.slots.find((s) => s.start === slotStart);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slotStart) return;
    if ((await mutation.submit())?.ok) setSent(true);
  };

  return (
    <Dialog open wide onClose={onClose} title={`1-on-1 with ${recipientName}`}>
      <p className="-mt-2 mb-3 text-sm text-fg-muted">{option.eventName}</p>
      {sent ? (
        <MeetingRequestSent
          what={`${recipientName} for ${slot?.label} on ${day?.label}`}
          onClose={onClose}
        />
      ) : (
        <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
          <MeetingRequestError
            what={`${recipientName} for ${slot?.label ?? "that slot"} on ${day?.label ?? "that day"}`}
            error={mutation.error}
            unreachable={mutation.unreachable}
          />
          <MeetingLengthChips
            lengths={option.lengths}
            slotCount={slotCount}
            onSlotCount={(count) => {
              setSlotCount(count);
              setSlotStart(null);
            }}
          />
          <div className="max-h-64 overflow-y-auto">
            <SlotList
              days={days}
              selected={slotStart}
              onSelect={setSlotStart}
            />
          </div>
          <MeetingClashNotice
            lines={slot?.state === "busy" ? [clashLines(slot.clashes)] : []}
          />
          <MeetingRequestFields
            meetingPoints={option.meetingPoints}
            meetingPoint={meetingPoint}
            onMeetingPoint={setMeetingPoint}
            message={message}
            onMessage={setMessage}
            isSending={mutation.pending}
            submitDisabled={!slotStart}
            onCancel={onClose}
            errors={mutation.fields}
          />
        </form>
      )}
    </Dialog>
  );
}
