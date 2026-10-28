import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { clashLines } from "@schellingboard/domain/meeting-clash-text";
import type { MeetingRequestCalls } from "../../commands/meeting-request";
import { useFormMutation } from "../../commands/use-form-mutation";
import type {
  MeetingCandidate,
  MeetingCandidates,
  MeetingCandidatesQuery,
} from "../../queries/meeting-candidates";
import { Avatar } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";
import {
  MeetingClashNotice,
  MeetingLengthChips,
  MeetingRequestError,
  MeetingRequestFields,
  MeetingRequestSent,
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
  calls: MeetingRequestCalls;
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
  const title = chosen
    ? `1-on-1 with ${chosen.name}`
    : found
      ? `Who's free at ${found.slotLabel.split(" – ")[0]}?`
      : "1-on-1";

  return (
    <Dialog open wide onClose={onClose} title={title}>
      {state.status === "gone" || state.status === "error" ? (
        <p className="text-fg">
          {state.status === "gone"
            ? "That slot is no longer open for 1-on-1s."
            : "Couldn't load who is free then. Try the slot again."}
        </p>
      ) : !found ? (
        <p className="text-fg-muted">Loading…</p>
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
          {clashLines(found.yourClashes)} during this time — book it anyway?
        </p>
      )}

      {found.candidates.length === 0 ? (
        <p className="text-fg-muted">Nobody has marked this time free.</p>
      ) : (
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {found.candidates.map((candidate) => (
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
                  <a
                    href={profileHref(candidate.id)}
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-brand-fg hover:text-brand-fg-hover"
                  >
                    {candidate.name}
                  </a>
                  {candidate.isHost && (
                    <span className="w-fit rounded-full bg-brand-tint-hover px-3 py-1 text-xs font-semibold text-brand-fg">
                      Session host
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
                    Already booked at this time
                  </span>
                )}
              </div>
              <Button
                variant="quiet"
                disabled={loading}
                onClick={() => onPick(candidate)}
                aria-label={`Ask ${candidate.name}`}
              >
                Ask
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-fg-subtle">
        Only people who marked this time free are listed. Nobody is told you
        looked.
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
  calls: MeetingRequestCalls;
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
  const [sent, setSent] = useState(false);
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
  const what = `${candidate.name} for ${found.slotLabel} on ${found.dayLabel}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if ((await mutation.submit())?.ok) {
      setSent(true);
      onBooked();
    }
  };

  if (sent) {
    return <MeetingRequestSent what={what} onClose={onClose} />;
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
      <span className="-mt-2 block text-sm text-fg-muted">
        {found.dayLabel}, {found.slotLabel}
      </span>

      <MeetingRequestError
        what={what}
        error={mutation.error}
        unreachable={mutation.unreachable}
      />

      <MeetingClashNotice
        lines={[
          ...(found.yourClashes.length > 0
            ? [clashLines(found.yourClashes)]
            : []),
          ...(candidate.busy ? [`${candidate.name} is already booked`] : []),
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
        cancelLabel="Someone else"
        errors={mutation.fields}
      />
    </form>
  );
}
