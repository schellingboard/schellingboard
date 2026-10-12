import type { FeedMessage } from "@schellingboard/contracts/feed";
import type { RecordedChange, Viewer } from "@schellingboard/domain/change";
import { toSnapshotSessionView } from "@/server/modules/sessions/module";

// Only the actor learns the key: keys are unique per actor. Coarser than ADR
// 0012 section 5's scope (no admin id, no cookie level); see ADR 0014.
function commandKeyFor(change: RecordedChange, viewer: Viewer): string | null {
  const { actor } = change;
  const own =
    actor.type === "guest"
      ? actor.id === viewer.guestId
      : actor.type === "admin" && viewer.admin;
  return own ? change.commandKey : null;
}

export function project(
  change: RecordedChange,
  viewer: Viewer
): FeedMessage | undefined {
  const common = { seq: change.seq, commandKey: commandKeyFor(change, viewer) };
  switch (change.type) {
    case "session.changed":
      return {
        ...common,
        type: change.type,
        session: toSnapshotSessionView(change.payload.after),
      };
    case "session.deleted":
      return { ...common, type: change.type, sessionId: change.subjectId };
    default:
      return undefined;
  }
}
