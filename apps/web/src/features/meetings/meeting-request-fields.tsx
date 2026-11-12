import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

import { Button } from "../../ui/button";
import { TextField } from "../../ui/form";
import type { Notice } from "../../ui/notices";

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
    <div role="group" aria-label={t`Length`} className="flex flex-col gap-1">
      <span className="text-sm font-medium text-fg-muted">
        <Trans>Length</Trans>
      </span>
      <ul className="flex flex-wrap gap-2">
        {lengths.map((length) => {
          const { minutes } = length;
          return (
            <li key={length.slotCount}>
              <button
                type="button"
                aria-pressed={slotCount === length.slotCount}
                onClick={() => onSlotCount(length.slotCount)}
                className={`rounded-full border px-3 py-1 text-sm tabular-nums transition-colors ${
                  slotCount === length.slotCount ? CHIP_ON : CHIP_OFF
                }`}
              >
                <Trans>{minutes} min</Trans>
              </button>
            </li>
          );
        })}
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
  cancelLabel,
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
  cancelLabel?: string;
  errors?: Record<string, string>;
}) {
  const described = meetingPoints.filter((p) => p.description);
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-fg-muted">
          <Trans>Where to meet</Trans>
        </span>
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
          label={t`Where to meet`}
          hideLabel
          name="meetingPoint"
          value={meetingPoint}
          onChange={onMeetingPoint}
          placeholder={t`or type somewhere else`}
          error={errors.meetingPoint}
        />
        <p className="text-xs text-fg-subtle">
          <Trans>
            Nothing is reserved — this is just where to find each other.
          </Trans>
        </p>
      </div>

      <TextField
        label={t`Add a line of context (optional)`}
        name="message"
        value={message}
        onChange={onMessage}
        placeholder={t`Would love to talk about…`}
        error={errors.message}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={isSending || submitDisabled || !meetingPoint.trim()}
        >
          {isSending ? t`Sending...` : t`Send request`}
        </Button>
        <Button type="button" variant="quiet" onClick={onCancel}>
          {cancelLabel ?? t`Cancel`}
        </Button>
      </div>
    </>
  );
}

/** What a request is about: a slot with a person, or an ask to open up. */
export type RequestSubject =
  | { kind: "slot"; name: string; slotLabel: string; dayLabel: string }
  | { kind: "person"; name: string }
  | { kind: "openUp"; name: string };

/** The toast after a request is sent: "Asked Al for 09:10 – 09:40 on Sat 9 May." */
export const requestSentNotice = (
  name: string,
  slotLabel: string,
  dayLabel: string
): Notice => ({
  tone: "info",
  message: t`Asked ${name} for ${slotLabel} on ${dayLabel}. You'll hear when they answer.`,
  autoDismissMs: 10_000,
});

function failureText(
  subject: RequestSubject,
  error: string,
  unreachable: boolean
): string {
  const { name } = subject;
  if (subject.kind === "openUp") {
    return unreachable
      ? t`Your request to ask ${name} to open up to 1-on-1s: ${error}`
      : t`Could not ask ${name} to open up to 1-on-1s. ${error}`;
  }
  if (subject.kind === "person") {
    return unreachable
      ? t`Your request to ask ${name}: ${error}`
      : t`Could not ask ${name}. ${error}`;
  }
  const { slotLabel, dayLabel } = subject;
  return unreachable
    ? t`Your request to ask ${name} for ${slotLabel} on ${dayLabel}: ${error}`
    : t`Could not ask ${name} for ${slotLabel} on ${dayLabel}. ${error}`;
}

/** Names who and when; an unreachable answer must not claim it failed. */
export function MeetingRequestError({
  subject,
  error,
  unreachable,
}: {
  subject: RequestSubject;
  error: string | null;
  unreachable: boolean;
}) {
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-danger-fg">
      {failureText(subject, error, unreachable)}
    </p>
  );
}

/** A clash is raised, never enforced: the pair decide for themselves. */
export function MeetingClashNotice({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <p className="rounded-md bg-warning-tint p-3 text-sm text-fg">
      {lines.join(" ")} <Trans>Book it anyway?</Trans>
    </p>
  );
}
