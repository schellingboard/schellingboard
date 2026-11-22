import { i18n } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { ApiClient } from "@schellingboard/api-client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { createAdminGate } from "../queries/admin-gate";
import { cx } from "../ui/cx";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkOutlineIcon,
} from "../ui/icons";
import { NoticeProvider } from "../ui/notices";
import { useDismiss } from "../ui/use-dismiss";
import { Footer } from "./footer";
import { hardNavigate } from "./hard-navigate";
import { useHealth } from "./health";
import { ThemeProvider } from "./theme";
import { useUpdateStatus } from "./updates";

const ReloadGate = createContext<() => void>(() => {});

/** Reads the gate again, so the header shows a title that a page just changed. */
export const useReloadAdminGate = () => useContext(ReloadGate);

/** One centred frame for the header and every page, so nothing shifts between pages. */
const FRAME = "mx-auto w-full max-w-[120rem] px-3 lg:px-8";

const LOGIN = "/auth/login";

const LINKS = [
  { href: "/admin/events", label: msg`Events` },
  { href: "/admin/users", label: msg`Users` },
  { href: "/admin/locations", label: msg`Locations` },
  { href: "/admin/statistics", label: msg`Statistics` },
  { href: "/admin/settings", label: msg`Settings` },
];

function NavLinks({
  currentPath,
  block,
}: {
  currentPath: string;
  block?: boolean;
}) {
  return (
    <nav
      aria-label={t`Admin`}
      className={cx(block ? "flex flex-col gap-1" : "flex gap-1")}
    >
      {LINKS.map((link) => {
        const active = currentPath.startsWith(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              block && "block",
              active
                ? "bg-bar-fg/15 text-bar-fg"
                : "text-bar-fg-subtle hover:bg-bar-fg/10 hover:text-bar-fg"
            )}
          >
            {i18n._(link.label)}
          </a>
        );
      })}
    </nav>
  );
}

function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const logout = async () => {
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/api/v1/auth/sign-out", {
        method: "POST",
      });
      // Already signed out (an expired cookie) is the state logging out aims for.
      if (!response.ok && response.status !== 401 && response.status !== 403)
        throw new Error(`logout ${response.status}`);
      hardNavigate(LOGIN);
    } catch {
      setPending(false);
      setFailed(true);
    }
  };
  return (
    <>
      <button
        type="button"
        onClick={() => void logout()}
        disabled={pending}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-bar-fg-subtle transition-colors hover:bg-bar-fg/10 hover:text-bar-fg disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4" />
        {pending ? t`Logging out...` : t`Admin logout`}
      </button>
      {failed && (
        <span role="alert" className="text-sm text-bar-fg">
          <Trans>Could not log out. Try again.</Trans>
        </span>
      )}
    </>
  );
}

function AdminHeader({
  title,
  currentPath,
}: {
  title: string;
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useDismiss(open, () => setOpen(false), root, toggle);
  return (
    <header ref={root} className="bg-bar text-bar-fg">
      <div
        className={cx(FRAME, "flex items-center justify-between gap-4 py-3")}
      >
        <a href="/admin" className="font-semibold hover:text-bar-fg-subtle">
          <Trans>{title} Admin</Trans>
        </a>
        <div className="hidden items-center gap-4 sm:flex">
          <NavLinks currentPath={currentPath} />
          <LogoutButton />
        </div>
        <button
          ref={toggle}
          type="button"
          aria-label={open ? t`Close admin menu` : t`Open admin menu`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-md p-2 text-bar-fg-subtle hover:bg-bar-fg/10 hover:text-bar-fg sm:hidden"
        >
          {open ? (
            <XMarkOutlineIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-bar-fg/20 px-3 py-3 sm:hidden">
          <NavLinks currentPath={currentPath} block />
          <LogoutButton />
        </div>
      )}
    </header>
  );
}

/**
 * The admin section's header, footer and gate. A refused admin read sends the
 * browser to the sign-in, which brings it back to `currentPath` after.
 */
export function AdminFrame({
  api,
  currentPath,
  search,
  children,
}: {
  api: ApiClient;
  currentPath: string;
  search: string;
  children: ReactNode;
}) {
  const [gate] = useState(() => createAdminGate({ api }));
  useEffect(() => {
    void gate.load();
  }, [gate]);
  const state = useSyncExternalStore(gate.subscribe, gate.get);
  const reload = useCallback(() => void gate.load(), [gate]);
  const errorCode = state.status === "error" ? state.code : undefined;
  const health = useHealth(api);
  const update = useUpdateStatus(api);

  useEffect(() => {
    if (state.status === "refused")
      hardNavigate(
        `${LOGIN}?redirect=${encodeURIComponent(currentPath + search)}`
      );
  }, [state.status, currentPath, search]);

  return (
    <ThemeProvider>
      <NoticeProvider>
        <div
          data-admin-frame
          className="flex min-h-dvh flex-col bg-surface text-fg"
        >
          {state.status === "open" && (
            <AdminHeader title={state.title} currentPath={currentPath} />
          )}
          <main className="flex-1 py-6 lg:pb-16">
            <div className={cx(FRAME, "flex flex-col")}>
              {state.status === "open" && (
                <ReloadGate.Provider value={reload}>
                  {children}
                </ReloadGate.Provider>
              )}
              {state.status === "error" && (
                <p role="alert" className="text-sm text-danger-fg">
                  <Trans>Could not open the admin area ({errorCode}).</Trans>
                </p>
              )}
            </div>
          </main>
          <Footer api={api} version={health?.version} update={update} />
        </div>
      </NoticeProvider>
    </ThemeProvider>
  );
}
