import { useCallback, useEffect, useRef } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { CommandRunner } from "../commands/runner";
import { createCommentsQuery } from "../queries/comments";
import {
  createCommentsController,
  type Liker,
} from "../queries/comments-controller";

type Subject = Parameters<typeof createCommentsQuery>[0]["subject"];

/** Opens the comments of a session or proposal: the query and the controller that writes to it. */
export function useCommentSource(
  api: ApiClient,
  runner: CommandRunner,
  snapshot: Snapshot
) {
  const guest = snapshot.guests.find((g) => g.id === snapshot.me?.guestId);
  const me = useRef<Liker | null>(null);
  useEffect(() => {
    me.current = guest
      ? { id: guest.id, name: guest.name, avatarUrl: guest.avatarUrl }
      : null;
  }, [guest]);
  return useCallback(
    (subject: Subject) => {
      const query = createCommentsQuery({ api, subject });
      return {
        query,
        controller: createCommentsController({
          runner,
          query,
          subject,
          me: () => me.current,
        }),
      };
    },
    [api, runner]
  );
}
