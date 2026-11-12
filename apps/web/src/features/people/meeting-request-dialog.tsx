import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type FormEvent, useState } from "react";

import type { MeetingRequestCalls } from "../../commands/meeting-request";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { ProfileMeetingOption } from "../../queries/profile-activity";
import { Dialog } from "../../ui/dialog";
import { useNotify } from "../../ui/notices";
import {
  MeetingClashNotice,
  MeetingLengthChips,
  MeetingRequestError,
  MeetingRequestFields,
  requestSentNotice,
  type RequestSubject,
} from "../meetings/meeting-request-fields";
import { timeClashSentences } from "../schedule/meeting-clash-text";

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
                      <span className="block text-xs">
                        <Trans>Unavailable</Trans>
                      </span>
                    )}
                    {slot.state === "busy" && (
                      <span className="block text-xs">
                        <Trans comment="Time slot: the person has something else then">
                          Busy
                        </Trans>
                      </span>
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
  const notify = useNotify();

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

  const subject: RequestSubject =
    slot && day
      ? {
          kind: "slot",
          name: recipientName,
          slotLabel: slot.label,
          dayLabel: day.label,
        }
      : { kind: "person", name: recipientName };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slotStart) return;
    if (!(await mutation.submit())?.ok) return;
    if (subject.kind === "slot") {
      notify(
        requestSentNotice(subject.name, subject.slotLabel, subject.dayLabel)
      );
    }
    onClose();
  };

  return (
    <Dialog open wide onClose={onClose} title={t`1-on-1 with ${recipientName}`}>
      <p className="-mt-2 mb-3 text-sm text-fg-muted">{option.eventName}</p>
      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
        <MeetingRequestError
          subject={subject}
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
          <SlotList days={days} selected={slotStart} onSelect={setSlotStart} />
        </div>
        <MeetingClashNotice
          lines={slot?.state === "busy" ? timeClashSentences(slot.clashes) : []}
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
    </Dialog>
  );
}
