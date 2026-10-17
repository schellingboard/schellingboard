"use client";

import { createSessionComment } from "./comment-actions";
import { CommentsSection } from "./comments-section";
import { useComments } from "./use-comments";

// The session modal opens by pushing the URL locally, without an RSC
// roundtrip, so its comments can't arrive as server props: they load through
// /api/session/[sessionId]/comments instead, and every mutation reloads them.
export function SessionComments({
  sessionId,
  eventSlug,
  timezone,
}: {
  sessionId: string;
  eventSlug: string;
  timezone: string;
}) {
  const { comments, changed } = useComments(
    `/api/session/${sessionId}/comments`
  );

  return (
    <CommentsSection
      timezone={timezone}
      comments={comments}
      create={(input, key) =>
        createSessionComment({ sessionId, ...input }, key)
      }
      permalinkFor={(commentId) =>
        `/${eventSlug}?viewSession=${sessionId}#comment-${commentId}`
      }
      changed={changed}
    />
  );
}
