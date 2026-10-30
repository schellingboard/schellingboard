import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import { safeRedirectPath } from "@schellingboard/domain/safe-redirect";
import { signInCalls } from "../commands/sign-in";
import { meetingAvailabilityCalls } from "../commands/meeting-availability";
import { notificationCalls } from "../commands/notifications";
import { settingsCalls } from "../commands/settings";
import { NotificationsScreen } from "../features/notifications/notifications-screen";
import { AccountSecurityScreen } from "../features/sign-in/account-security";
import { SiteLoginScreen } from "../features/sign-in/site-login-screen";
import { LoginScreen } from "../features/sign-in/guest-login-form";
import { ResetScreen } from "../features/sign-in/reset-password-form";
import {
  Appearance,
  SettingsScreen,
} from "../features/settings/settings-screen";
import { createAccountSecurityQuery } from "../queries/account-security";
import { createNotificationsQuery } from "../queries/notifications";
import { createSettingsQuery } from "../queries/settings";
import { Footer } from "./footer";
import { hardNavigate } from "./hard-navigate";
import { useHealth } from "./health";
import { Layout } from "./layout";
import { ThemeProvider } from "./theme";
import { NoticeProvider } from "../ui/notices";
import { PageNotice } from "./page-notice";
import type { AppServices } from "./services";
import { ShellFrame, ShellProviders } from "./shell";
import { useUnread } from "./unread-count";
import { useDirectoryShell } from "./use-directory-shell";
import { useUrlSearchParams } from "./use-url-search-params";
import { useViewer } from "./viewer";

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
      {({ now }) => <Notifications api={services.api} now={now} />}
    </AccountFrame>
  );
}

/** The shared site password, asked of a visitor who has no site cookie yet. */
export function SiteLoginPage({ services }: { services: AppServices }) {
  const { api } = services;
  const { params } = useUrlSearchParams();
  const health = useHealth(api);
  const calls = useMemo(() => signInCalls(api), [api]);
  const target = safeRedirectPath(params.get("redirect"), "/");
  return (
    <ThemeProvider>
      <NoticeProvider>
        <Layout nav={null} footer={<Footer version={health?.version} />}>
          <SiteLoginScreen
            calls={calls}
            onEntered={() => hardNavigate(target)}
          />
        </Layout>
      </NoticeProvider>
    </ThemeProvider>
  );
}

/** The emailed login link's landing page, or a plain sign-in. */
export function LoginPage({ services }: { services: AppServices }) {
  return (
    <AccountFrame services={services}>
      {(shell) => <Login api={services.api} {...shell} />}
    </AccountFrame>
  );
}

/** The emailed link that sets a password. */
export function ResetPage({ services }: { services: AppServices }) {
  return (
    <AccountFrame services={services}>
      {(shell) => <Reset api={services.api} {...shell} />}
    </AccountFrame>
  );
}

/** Protection, username and signed-in browsers of the signed-in guest. */
export function AccountSecurityPage({ services }: { services: AppServices }) {
  return (
    <AccountFrame services={services}>
      {(shell) => <Security api={services.api} {...shell} />}
    </AccountFrame>
  );
}

type Shell = {
  now: Date;
  entries: { id: string; name: string }[];
  loaded: boolean;
  failed: boolean;
};

function AccountFrame({
  services,
  children,
}: {
  services: AppServices;
  children: (shell: Shell) => ReactNode;
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
  children: (shell: Shell) => ReactNode;
}) {
  const { now, frame, entries, status } = useDirectoryShell(api);
  return (
    <ShellFrame api={api} {...frame}>
      {children({
        now,
        entries,
        loaded: status === "ready",
        failed: status === "error",
      })}
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
        security: "/account-security",
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

function DirectoryWait({ failed }: { failed: boolean }) {
  return failed ? (
    <p role="alert" className="text-danger-fg">
      Could not load the names. Reload the page to try again.
    </p>
  ) : (
    <p role="status">Loading…</p>
  );
}

function Login({
  api,
  entries,
  loaded,
  failed,
}: { api: AppServices["api"] } & Pick<Shell, "entries" | "loaded" | "failed">) {
  const { params } = useUrlSearchParams();
  const calls = useMemo(() => signInCalls(api), [api]);
  const guestId = params.get("guest");
  const named = entries.find((e) => e.id === guestId);
  if (guestId && !named && !loaded) return <DirectoryWait failed={failed} />;
  return (
    <LoginScreen
      calls={calls}
      guest={guestId ? (named ?? null) : undefined}
      code={params.get("code") ?? undefined}
      onSignedIn={() => hardNavigate("/")}
    />
  );
}

function Reset({
  api,
  entries,
  loaded,
  failed,
}: { api: AppServices["api"] } & Pick<Shell, "entries" | "loaded" | "failed">) {
  const { refresh } = useViewer();
  const { params } = useUrlSearchParams();
  const calls = useMemo(() => signInCalls(api), [api]);
  const guestId = params.get("guest");
  const named = entries.find((e) => e.id === guestId);
  if (guestId && !named && !loaded) return <DirectoryWait failed={failed} />;
  return (
    <ResetScreen
      calls={calls}
      guest={named ?? null}
      token={params.get("token") ?? undefined}
      signInHref={`/auth/login?guest=${encodeURIComponent(guestId ?? "")}`}
      onPasswordSet={() => void refresh()}
    />
  );
}

function Security({
  api,
  entries,
  loaded,
  failed,
}: { api: AppServices["api"] } & Pick<Shell, "entries" | "loaded" | "failed">) {
  const viewer = useViewer();
  const [query] = useState(() => createAccountSecurityQuery({ api }));
  useEffect(() => {
    void query.load();
  }, [query, viewer.guestId]);
  const state = useSyncExternalStore(query.subscribe, query.get);
  const calls = useMemo(() => signInCalls(api), [api]);
  const guest = entries.find((e) => e.id === viewer.guestId);
  if (viewer.guestId && !guest && !loaded)
    return <DirectoryWait failed={failed} />;
  return (
    <AccountSecurityScreen
      state={state}
      calls={calls}
      guest={guest ?? { id: viewer.guestId ?? "", name: "" }}
      reload={() => void query.load()}
      backHref="/settings"
    />
  );
}
