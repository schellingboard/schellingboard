import { t } from "@lingui/core/macro";
import { useState } from "react";

import type { MeetingRequestCalls } from "../../commands/meeting-request";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { ProfileNudge } from "../../queries/profile-activity";
import { MeetingRequestError } from "../meetings/meeting-request-fields";

const SECONDARY =
  "rounded-md border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium text-fg hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60";

/** Where "Schedule a 1-on-1" would be, for someone who has not opened up. */
export function OpenUpNudge({
  nudge,
  guestId,
  guestName,
  showEvent,
  calls,
}: {
  nudge: ProfileNudge;
  guestId: string;
  guestName: string;
  showEvent: boolean;
  calls: MeetingRequestCalls;
}) {
  const [asked, setAsked] = useState(nudge.state === "asked");
  const mutation = useFormMutation({
    call: (key) => calls.askToOpenUp(guestId, nudge.eventId, key),
  });
  const { eventName } = nudge;
  const ask = async () => {
    if ((await mutation.submit())?.ok) setAsked(true);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-fg-muted">
        {showEvent
          ? t`Not open to 1-on-1s yet at ${eventName}`
          : t`Not open to 1-on-1s yet`}
      </p>
      <MeetingRequestError
        subject={{ kind: "openUp", name: guestName }}
        error={mutation.error}
        unreachable={mutation.unreachable}
      />
      <button
        type="button"
        disabled={asked || mutation.pending}
        onClick={() => void ask()}
        className={SECONDARY}
      >
        {asked
          ? t({
              message: "Asked",
              comment: "Button state: the request to open up was sent",
            })
          : t`Ask them to open up`}
      </button>
    </div>
  );
}
