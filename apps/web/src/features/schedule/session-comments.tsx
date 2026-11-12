import { useCallback } from "react";

import { COMMENT_HASH_PREFIX, Comments } from "../comments/comments-section";
import { useSchedule } from "./context";

export function SessionComments({ sessionId }: { sessionId: string }) {
  const { actions, data, timezone, links, setHash } = useSchedule();
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
      commentHref={(id) =>
        `${links.session(sessionId)}${COMMENT_HASH_PREFIX}${id}`
      }
      setHash={setHash}
    />
  );
}
