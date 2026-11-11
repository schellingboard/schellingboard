import { useEffect, useState } from "react";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import { clashLines } from "@schellingboard/domain/meeting-clash-text";
import { Button } from "../../ui/button";
import { CopyLinkButton } from "../../ui/copy-link-button";
import { SidePanel } from "../../ui/side-panel";
import { TextField } from "../../ui/form";
import { canCancel, statusLine } from "../schedule/meeting-rules";
import type { MeetingView } from "../schedule/meeting-view";
import { PersonLink } from "../people/person-link";

/** One 1-on-1 in full and, for the person asked, Accept and Decline. */
export function MeetingPanel({
  meeting,
  now,
  readOnly,
  profileHref,
  onAnswer,
  onCancel,
  onClose,
  onBack,
}: {
  /** Undefined once it is not among the viewer's own. */
  meeting: MeetingView | undefined;
  now: Date;
  readOnly: boolean;
  profileHref: (guestId: string) => string;
  onAnswer: (response: "accept" | "decline") => void;
  onCancel: (note: string) => void;
  onClose: () => void;
  onBack?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");

  return (
    <SidePanel
      label="1-on-1 details"
      onClose={onClose}
      onBack={onBack}
      title={
        meeting ? (
          <>
            1-on-1 with{" "}
            <PersonLink
              guestId={meeting.otherId}
              href={profileHref(meeting.otherId)}
              name={meeting.otherName}
              className="text-brand-fg hover:text-brand-fg-hover hover:underline"
            />
          </>
        ) : (
          "1-on-1"
        )
      }
    >
      {!meeting ? (
        <p className="text-fg-muted">1-on-1 not found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-fg-muted">When</dt>
              <dd className="text-fg">
                {meeting.dayLabel}, {meeting.timeLabel}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-fg-muted">Where</dt>
              <dd className="text-fg">{meeting.meetingPoint}</dd>
            </div>
          </dl>

          <p className="text-sm text-fg-muted">{statusLine(meeting)}</p>

          {readOnly && (
            <p className="text-sm text-fg-muted">
              1-on-1s can only be answered or canceled during the scheduling
              phase.
            </p>
          )}

          {meeting.message && (
            <p className="rounded-md bg-surface-sunken p-3 text-sm text-fg">
              {meeting.message}
            </p>
          )}

          {meeting.cancelNote && (
            <p className="rounded-md bg-surface-sunken p-3 text-sm text-fg">
              <span className="font-medium text-fg-muted">
                Why it was called off:{" "}
              </span>
              {meeting.cancelNote}
            </p>
          )}

          {meeting.clashes.length > 0 && (
            <p className="rounded-md bg-warning-tint p-3 text-sm text-fg">
              {clashLines(meeting.clashes)} during this slot.
            </p>
          )}

          {!readOnly &&
            meeting.role === "recipient" &&
            meeting.status === "pending" && (
              <div className="flex gap-2">
                <Button onClick={() => onAnswer("accept")}>Accept</Button>
                {/* Declining takes no explanation: people must not feel obliged. */}
                <Button variant="quiet" onClick={() => onAnswer("decline")}>
                  Decline
                </Button>
              </div>
            )}

          {!readOnly &&
            canCancel(meeting, now) &&
            (confirming ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-fg">
                  {meeting.otherName} will be told. Cancel it?
                </p>
                <TextField
                  label="Say why, if you like (optional)"
                  name="cancelNote"
                  value={note}
                  onChange={setNote}
                  placeholder="Sorry — my session moved…"
                />
                <div className="flex gap-2">
                  <Button variant="danger" onClick={() => onCancel(note)}>
                    Yes, cancel it
                  </Button>
                  <Button variant="quiet" onClick={() => setConfirming(false)}>
                    Keep it
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="quiet"
                className="self-start"
                onClick={() => setConfirming(true)}
              >
                Cancel 1-on-1
              </Button>
            ))}

          <p className="text-xs text-fg-subtle">
            Nothing is reserved — the meeting point is just where to find each
            other.
          </p>
          <CopyLinkButton />
        </div>
      )}
    </SidePanel>
  );
}

/** Stands in for a 1-on-1 when the reader has no name chosen or a locked one. */
export function MeetingNeedsName({
  awaitingLogin,
  onClose,
  onBack,
}: {
  awaitingLogin: () => Promise<boolean>;
  onClose: () => void;
  onBack?: () => void;
}) {
  const [protectedName, setProtectedName] = useState<boolean>();
  useEffect(() => {
    void awaitingLogin().then(setProtectedName);
  }, [awaitingLogin]);
  return (
    <SidePanel
      label="1-on-1 details"
      title="1-on-1"
      onClose={onClose}
      onBack={onBack}
    >
      {protectedName !== undefined && (
        <p className="text-fg-muted">
          {actingGuestRefusalMessage(
            protectedName ? "guest.protected" : "guest.unselected",
            "opening your 1-on-1s"
          )}
        </p>
      )}
    </SidePanel>
  );
}
