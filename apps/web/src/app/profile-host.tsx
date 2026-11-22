import { t } from "@lingui/core/macro";
import type { ApiClient } from "@schellingboard/api-client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { actingGuestRefusal } from "../commands/acting-guest-message";
import { failureNotice } from "../commands/failure-message";
import { newKey } from "../commands/keys";
import { meetingRequestCalls } from "../commands/meeting-request";
import { profileFormCalls } from "../commands/profile-form";
import { createCommandRunner } from "../commands/runner";
import { cardsFrom, everyoneIn } from "../features/people/directory-model";
import { profileLinks } from "../features/people/links";
import { ProfileForm } from "../features/people/profile-form";
import { ProfilePanel } from "../features/people/profile-panel";
import { useFormatLocale } from "../i18n/format-locale";
import { createDirectoryQuery } from "../queries/directory";
import { createProfileActivityQuery } from "../queries/profile-activity";
import { blankSnapshot } from "../replica/blank";
import { createReplicaStore } from "../replica/store";
import { useNotify } from "../ui/notices";
import { SidePanel } from "../ui/side-panel";
import { FormBody } from "./panel-host";
import { useProfileWalk } from "./profile-walk";
import { useCommentSource } from "./use-comment-actions";
import { usePanel } from "./use-panel";
import { useViewer } from "./viewer";

/** The open profile, over whatever page is behind it; the host sits outside every page. */
export function ProfilePanelHost({ api }: { api: ApiClient }) {
  const { panel } = usePanel();
  if (panel?.item.kind === "profile-form")
    return <ProfileFormHost api={api} depth={panel.depth} />;
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
  const locale = useFormatLocale();
  const everyone = useMemo(
    () => everyoneIn(cardsFrom(entries, now, locale)),
    [entries, now, locale]
  );

  const runner = useMemo(
    () =>
      createCommandRunner({
        store: createReplicaStore(blankSnapshot(new Date().toISOString())),
        api,
        newKey,
        onFailure: (failure) => notify(failureNotice(failure)),
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

function ProfileFormHost({ api, depth }: { api: ApiClient; depth: number }) {
  const { close, back } = usePanel();
  const viewer = useViewer();
  const viewerId = viewer.guestId ?? null;
  const missing = viewer.guestId !== undefined && !viewerId;
  const actions = useMemo(() => profileFormCalls(api), [api]);
  const directory = useMemo(() => createDirectoryQuery({ api }), [api]);
  const { status, entries } = useSyncExternalStore(
    directory.subscribe,
    directory.get
  );
  const [fresh, setFresh] = useState(false);
  const [awaitingLogin, setAwaitingLogin] = useState<boolean>();
  const leaving = useRef(false);
  const leave = (then: () => void) => {
    leaving.current = true;
    then();
  };
  useEffect(() => {
    let stale = false;
    void directory.refresh().then(() => {
      if (!stale) setFresh(true);
    });
    return () => {
      stale = true;
    };
  }, [directory]);
  useEffect(() => {
    if (!missing) return;
    let stale = false;
    void api.GET("/api/v1/me/identity").then(({ data }) => {
      if (!stale) setAwaitingLogin(data?.awaitingLogin === true);
    });
    return () => {
      stale = true;
    };
  }, [api, missing]);

  const me = entries.find((e) => e.id === viewerId);
  const body = () => {
    if (missing && awaitingLogin !== undefined)
      return (
        <p className="text-fg-muted">
          {actingGuestRefusal(
            awaitingLogin ? "guest.protected" : "guest.unselected",
            "editProfile"
          )}
        </p>
      );
    if (!viewerId || !fresh || (status === "loading" && entries.length === 0))
      return (
        <p role="status" className="text-fg-muted">
          {t`Loading…`}
        </p>
      );
    if (!me || status === "error")
      return (
        <p className="text-fg-muted">
          {t`Profile not found, please log in again.`}
        </p>
      );
    return (
      <FormBody leaving={leaving}>
        {(cancel, track) => (
          <ProfileForm
            key={me.id}
            profile={me}
            links={{ settings: "/settings" }}
            actions={actions}
            onCancel={cancel}
            track={track}
            onDone={() => leave(depth > 1 ? back : close)}
          />
        )}
      </FormBody>
    );
  };

  return (
    <SidePanel
      label={t`Edit profile form`}
      title={t`Edit profile`}
      onClose={() => leave(close)}
      onBack={depth > 1 ? () => leave(back) : undefined}
      guardUnload
    >
      {body()}
    </SidePanel>
  );
}
