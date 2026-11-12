import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { clashLines } from "@schellingboard/domain/meeting-clash-text";
import {
  type FormEvent,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import type { MeetingBookingCalls } from "../../commands/meeting-request";
import { useFormMutation } from "../../commands/use-form-mutation";
import type {
  MeetingCandidate,
  MeetingCandidates,
  MeetingCandidatesQuery,
} from "../../queries/meeting-candidates";
import { Avatar } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";
import { useNotify } from "../../ui/notices";
import { PersonLink } from "../people/person-link";
import {
  MeetingClashNotice,
  MeetingLengthChips,
  MeetingRequestError,
  MeetingRequestFields,
  requestSentNotice,
} from "./meeting-request-fields";

/** Booking a 1-on-1 from the schedule: the slot is known, the person is not. */
export function BookMeeting({
  query,
  calls,
  profileHref,
  onBooked,
  onClose,
}: {
  query: MeetingCandidatesQuery;
  calls: MeetingBookingCalls;
  profileHref: (guestId: string) => string;
  /** Told once a request is sent, so the column can show it straight away. */
  onBooked: () => void;
  onClose: () => void;
}) {
  const state = useSyncExternalStore(query.subscribe, query.get);
  const [slotCount, setSlotCount] = useState(1);
  const [chosen, setChosen] = useState<MeetingCandidate | null>(null);

  useEffect(() => {
    void query.load(slotCount);
  }, [query, slotCount]);

  const { found } = state;
  const chosenName = chosen?.name ?? "";
  const slotStartLabel = found?.slotLabel.split(" – ")[0] ?? "";
  const title = chosen
    ? t`1-on-1 with ${chosenName}`
    : found
      ? t`Who's free at ${slotStartLabel}?`
      : t`1-on-1`;

  return (
    <Dialog open wide onClose={onClose} title={title}>
      {state.status === "gone" || state.status === "error" ? (
        <p className="text-fg">
          {state.status === "gone"
            ? t`That slot is no longer open for 1-on-1s.`
            : t`Couldn't load who is free then. Try the slot again.`}
        </p>
      ) : !found ? (
        <p className="text-fg-muted">
          <Trans>Loading…</Trans>
        </p>
      ) : chosen ? (
        <RequestStep
          calls={calls}
          eventId={query.eventId}
          slotStart={query.slotStart}
          found={found}
          candidate={chosen}
          onBack={() => setChosen(null)}
          onBooked={onBooked}
          onClose={onClose}
        />
      ) : (
        <CandidateStep
          found={found}
          loading={state.status === "loading"}
          slotCount={slotCount}
          onSlotCount={setSlotCount}
          profileHref={profileHref}
          onPick={setChosen}
        />
      )}
    </Dialog>
  );
}

function CandidateStep({
  found,
  loading,
  slotCount,
  onSlotCount,
  profileHref,
  onPick,
}: {
  found: MeetingCandidates;
  loading: boolean;
  slotCount: number;
  onSlotCount: (slotCount: number) => void;
  profileHref: (guestId: string) => string;
  onPick: (candidate: MeetingCandidate) => void;
}) {
  const clashText = clashLines(found.yourClashes);
  return (
    <div className="flex flex-col gap-4">
      <span className="-mt-2 block text-sm text-fg-muted">
        {found.dayLabel}, {found.slotLabel} · {found.eventName}
      </span>

      <MeetingLengthChips
        lengths={found.lengths}
        slotCount={slotCount}
        onSlotCount={onSlotCount}
      />

      {found.yourClashes.length > 0 && (
        <p className="rounded-md bg-warning-tint p-3 text-sm text-fg">
          <Trans>{clashText} during this time — book it anyway?</Trans>
        </p>
      )}

      {found.candidates.length === 0 ? (
        <p className="text-fg-muted">
          <Trans>Nobody has marked this time free.</Trans>
        </p>
      ) : (
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {found.candidates.map((candidate) => {
            const { name } = candidate;
            return (
              <li
                key={candidate.id}
                className="flex items-center gap-4 rounded-md bg-surface-sunken p-2"
              >
                <Avatar
                  name={candidate.name}
                  size="sm"
                  image={candidate.avatarUrl}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {/* A new tab, so reading who they are does not cost the slot. */}
                    <PersonLink
                      guestId={candidate.id}
                      href={profileHref(candidate.id)}
                      name={candidate.name}
                      newTab
                      className="font-medium text-brand-fg hover:text-brand-fg-hover"
                    />
                    {candidate.isHost && (
                      <span className="w-fit rounded-full bg-brand-tint-hover px-3 py-1 text-xs font-semibold text-brand-fg">
                        <Trans>Session host</Trans>
                      </span>
                    )}
                  </span>
                  {(candidate.pronouns || candidate.basedIn) && (
                    <span className="line-clamp-1 text-sm text-fg-subtle">
                      {[candidate.pronouns, candidate.basedIn]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                  {candidate.busy && (
                    <span className="text-xs text-warning-fg">
                      <Trans>Already booked at this time</Trans>
                    </span>
                  )}
                </div>
                <Button
                  variant="quiet"
                  disabled={loading}
                  onClick={() => onPick(candidate)}
                  aria-label={t`Ask ${name}`}
                >
                  <Trans comment="Button: ask this person for a 1-on-1">
                    Ask
                  </Trans>
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-fg-subtle">
        <Trans>
          Only people who marked this time free are listed. Nobody is told you
          looked.
        </Trans>
      </p>
    </div>
  );
}

function RequestStep({
  calls,
  eventId,
  slotStart,
  found,
  candidate,
  onBack,
  onBooked,
  onClose,
}: {
  calls: MeetingBookingCalls;
  eventId: string;
  slotStart: string;
  found: MeetingCandidates;
  candidate: MeetingCandidate;
  onBack: () => void;
  onBooked: () => void;
  onClose: () => void;
}) {
  const [meetingPoint, setMeetingPoint] = useState("");
  const [message, setMessage] = useState("");
  const notify = useNotify();
  const mutation = useFormMutation({
    fieldNames: ["meetingPoint", "message"],
    call: (key) =>
      calls.request(
        {
          eventId,
          recipientId: candidate.id,
          slotStart,
          slotCount: found.slotCount,
          meetingPoint,
          message,
        },
        key
      ),
  });
  const { name } = candidate;
  const { slotLabel, dayLabel } = found;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if ((await mutation.submit())?.ok) {
      onBooked();
      notify(requestSentNotice(name, slotLabel, dayLabel));
      onClose();
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
      <span className="-mt-2 block text-sm text-fg-muted">
        {found.dayLabel}, {found.slotLabel}
      </span>

      <MeetingRequestError
        subject={{ kind: "slot", name, slotLabel, dayLabel }}
        error={mutation.error}
        unreachable={mutation.unreachable}
      />

      <MeetingClashNotice
        lines={[
          ...(found.yourClashes.length > 0
            ? [clashLines(found.yourClashes)]
            : []),
          ...(candidate.busy ? [t`${name} is already booked`] : []),
        ]}
      />

      <MeetingRequestFields
        meetingPoints={found.meetingPoints}
        meetingPoint={meetingPoint}
        onMeetingPoint={setMeetingPoint}
        message={message}
        onMessage={setMessage}
        isSending={mutation.pending}
        onCancel={onBack}
        cancelLabel={t`Someone else`}
        errors={mutation.fields}
      />
    </form>
  );
}
