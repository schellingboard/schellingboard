import { Button } from "../../ui/button";
import { TextField } from "../../ui/form";

export type MeetingPointChoice = {
  id: string;
  name: string;
  description: string;
};

const CHIP_ON = "border-brand bg-brand text-on-brand";
const CHIP_OFF = "border-line bg-surface-raised text-fg hover:bg-surface-hover";

export function MeetingLengthChips({
  lengths,
  slotCount,
  onSlotCount,
}: {
  lengths: { slotCount: number; minutes: number }[];
  slotCount: number;
  onSlotCount: (slotCount: number) => void;
}) {
  if (lengths.length < 2) return null;
  return (
    <div role="group" aria-label="Length" className="flex flex-col gap-1">
      <span className="text-sm font-medium text-fg-muted">Length</span>
      <ul className="flex flex-wrap gap-2">
        {lengths.map((length) => (
          <li key={length.slotCount}>
            <button
              type="button"
              aria-pressed={slotCount === length.slotCount}
              onClick={() => onSlotCount(length.slotCount)}
              className={`rounded-full border px-3 py-1 text-sm tabular-nums transition-colors ${
                slotCount === length.slotCount ? CHIP_ON : CHIP_OFF
              }`}
            >
              {length.minutes} min
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Where to meet and a line of context: the half of a 1-on-1 request that is the
 * same whether it was reached from a profile (person known, asks for a slot) or
 * from the schedule (slot known, asks for a person).
 */
export function MeetingRequestFields({
  meetingPoints,
  meetingPoint,
  onMeetingPoint,
  message,
  onMessage,
  isSending,
  submitDisabled,
  onCancel,
  errors = {},
}: {
  meetingPoints: MeetingPointChoice[];
  meetingPoint: string;
  onMeetingPoint: (value: string) => void;
  message: string;
  onMessage: (value: string) => void;
  isSending: boolean;
  submitDisabled?: boolean;
  onCancel: () => void;
  errors?: Record<string, string>;
}) {
  const described = meetingPoints.filter((p) => p.description);
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-fg-muted">Where to meet</span>
        {meetingPoints.length > 0 && (
          <ul className="mb-1 flex flex-wrap gap-2">
            {meetingPoints.map((point) => (
              <li key={point.id}>
                <button
                  type="button"
                  aria-pressed={meetingPoint === point.name}
                  onClick={() => onMeetingPoint(point.name)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    meetingPoint === point.name ? CHIP_ON : CHIP_OFF
                  }`}
                >
                  {point.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* All descriptions share one grid cell: the box is as tall as the
            longest, so choosing a chip never moves the Send button. */}
        {described.length > 0 && (
          <div className="mb-1 grid">
            {described.map((point) => (
              <p
                key={point.id}
                className={`col-start-1 row-start-1 text-xs text-fg-muted ${
                  point.name === meetingPoint ? "" : "invisible"
                }`}
              >
                {point.description}
              </p>
            ))}
          </div>
        )}
        <TextField
          label="Where to meet"
          hideLabel
          name="meetingPoint"
          value={meetingPoint}
          onChange={onMeetingPoint}
          placeholder="or type somewhere else"
          error={errors.meetingPoint}
        />
        <p className="text-xs text-fg-subtle">
          Nothing is reserved — this is just where to find each other.
        </p>
      </div>

      <TextField
        label="Add a line of context (optional)"
        name="message"
        value={message}
        onChange={onMessage}
        placeholder="Would love to talk about…"
        error={errors.message}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={isSending || submitDisabled || !meetingPoint.trim()}
        >
          {isSending ? "Sending..." : "Send request"}
        </Button>
        <Button type="button" variant="quiet" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
}
