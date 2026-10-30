import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import { meetingAvailabilityCalls } from "../commands/meeting-availability";
import { notificationCalls } from "../commands/notifications";
import { settingsCalls } from "../commands/settings";
import { NotificationsScreen } from "../features/notifications/notifications-screen";
import {
  Appearance,
  SettingsScreen,
} from "../features/settings/settings-screen";
import { createNotificationsQuery } from "../queries/notifications";
import { createSettingsQuery } from "../queries/settings";
import { PageNotice } from "./page-notice";
import type { AppServices } from "./services";
import { ShellFrame, ShellProviders } from "./shell";
import { useUnread } from "./unread-count";
import { useDirectoryShell } from "./use-directory-shell";

const REFUSALS = ["guest.unselected", "guest.protected"];

/** The signed-in guest's private settings. */
export function SettingsPage({ services }: { services: AppServices }) {
  return (
    <AccountFrame services={services}>
      {() => <Settings api={services.api} />}
    </AccountFrame>
  );
}

/** The signed-in guest's notifications. */
export function NotificationsPage({ services }: { services: AppServices }) {
  return (
    <AccountFrame services={services}>
      {(now) => <Notifications api={services.api} now={now} />}
    </AccountFrame>
  );
}

function AccountFrame({
  services,
  children,
}: {
  services: AppServices;
  children: (now: Date) => ReactNode;
}) {
  const { api } = services;
  return (
    <ShellProviders api={api}>
      <Frame api={api}>{children}</Frame>
    </ShellProviders>
  );
}

function Frame({
  api,
  children,
}: {
  api: AppServices["api"];
  children: (now: Date) => ReactNode;
}) {
  const { now, frame } = useDirectoryShell(api);
  return (
    <ShellFrame api={api} {...frame}>
      {children(now)}
    </ShellFrame>
  );
}

function Settings({ api }: { api: AppServices["api"] }) {
  const [query] = useState(() => createSettingsQuery({ api }));
  useEffect(() => {
    void query.load();
  }, [query]);
  const state = useSyncExternalStore(query.subscribe, query.get);
  const calls = useMemo(() => settingsCalls(api), [api]);
  const availability = useMemo(() => meetingAvailabilityCalls(api), [api]);

  if (state.status === "error" && REFUSALS.includes(state.code))
    return (
      <div className="flex flex-col gap-8">
        <PageNotice>
          {actingGuestRefusalMessage(state.code, "changing your settings")}
        </PageNotice>
        <Appearance />
      </div>
    );
  return (
    <SettingsScreen
      state={state}
      calls={calls}
      availability={availability}
      links={{
        profile: "/guests/edit",
        security: "/legacy/account-security",
      }}
    />
  );
}

function Notifications({ api, now }: { api: AppServices["api"]; now: Date }) {
  const { history } = useRouter();
  const [, setUnread] = useUnread();
  const [query] = useState(() =>
    createNotificationsQuery({ calls: notificationCalls(api) })
  );
  useEffect(() => {
    void query.load();
  }, [query]);
  const state = useSyncExternalStore(query.subscribe, query.get);

  if (state.status === "error" && REFUSALS.includes(state.code))
    return (
      <PageNotice>
        {actingGuestRefusalMessage(state.code, "seeing your notifications")}
      </PageNotice>
    );
  return (
    <NotificationsScreen
      query={query}
      now={now}
      onOpen={(url) => history.push(url)}
      onUnreadChange={setUnread}
    />
  );
}
