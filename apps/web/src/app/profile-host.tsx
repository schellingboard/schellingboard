import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ApiClient } from "@schellingboard/api-client";
import { failureMessage } from "../commands/failure-message";
import { newKey } from "../commands/keys";
import { meetingRequestCalls } from "../commands/meeting-request";
import { createCommandRunner } from "../commands/runner";
import { cardsFrom, everyoneIn } from "../features/people/directory-model";
import { profileLinks } from "../features/people/links";
import { ProfilePanel } from "../features/people/profile-panel";
import { createDirectoryQuery } from "../queries/directory";
import { createProfileActivityQuery } from "../queries/profile-activity";
import { blankSnapshot } from "../replica/blank";
import { createReplicaStore } from "../replica/store";
import { useNotify } from "../ui/notices";
import { useProfileWalk } from "./profile-walk";
import { usePanel } from "./use-panel";
import { useCommentSource } from "./use-comment-actions";
import { useViewer } from "./viewer";

/** The open profile, over whatever page is behind it; the host sits outside every page. */
export function ProfilePanelHost({ api }: { api: ApiClient }) {
  const { panel } = usePanel();
  if (panel?.item.kind !== "profile") return null;
  return <ProfileHost api={api} id={panel.item.id} depth={panel.depth} />;
}

function ProfileHost({
  api,
  id,
  depth,
}: {
  api: ApiClient;
  id: string;
  depth: number;
}) {
  const { open, close, back, setHash } = usePanel();
  const { rows } = useProfileWalk();
  const viewer = useViewer();
  const notify = useNotify();
  const [now] = useState(() => new Date());
  const directory = useMemo(() => createDirectoryQuery({ api }), [api]);
  useEffect(() => {
    void directory.refresh();
  }, [directory]);
  const { status, entries } = useSyncExternalStore(
    directory.subscribe,
    directory.get
  );
  const everyone = useMemo(
    () => everyoneIn(cardsFrom(entries, now)),
    [entries, now]
  );

  const runner = useMemo(
    () =>
      createCommandRunner({
        store: createReplicaStore(blankSnapshot(new Date().toISOString())),
        api,
        newKey,
        onFailure: (failure) =>
          notify({ tone: "failure", message: failureMessage(failure) }),
      }),
    [api, notify]
  );
  const viewerId = viewer.guestId ?? null;
  const me = entries.find((e) => e.id === viewerId);
  const liker = useMemo(
    () => me && { id: me.id, name: me.name, avatarUrl: me.avatarUrl },
    [me]
  );
  const openComments = useCommentSource(api, runner, liker ?? null);
  const comments = useCallback(
    (guestId: string, name: string) =>
      openComments({ kind: "profile", id: guestId, name }),
    [openComments]
  );
  const activity = useCallback(
    (guestId: string) => createProfileActivityQuery({ api, guestId }),
    [api]
  );
  const meetingRequests = useMemo(() => meetingRequestCalls(api), [api]);

  return (
    <ProfilePanel
      guestId={id}
      matches={rows}
      everyone={everyone}
      viewerId={viewerId}
      status={status}
      links={profileLinks}
      activity={activity}
      onOpen={(guestId) =>
        open({ kind: "profile", id: guestId }, { fromPanel: true })
      }
      onClose={close}
      onBack={depth > 1 ? back : undefined}
      meetingRequests={meetingRequests}
      comments={comments}
      setHash={setHash}
    />
  );
}
