import { useCallback } from "react";
import { Comments } from "../comments/comments-section";
import { useSchedule } from "./context";

export function SessionComments({ sessionId }: { sessionId: string }) {
  const { actions, data, timezone, links, params, setHash } = useSchedule();
  const open = useCallback(
    () => actions.comments(sessionId),
    [actions, sessionId]
  );
  return (
    <Comments
      open={open}
      viewerId={data.guestId}
      timezone={timezone}
      guestHref={links.guest}
      commentHref={(id) => `${links.session(params, sessionId)}#comment-${id}`}
      setHash={setHash}
    />
  );
}
