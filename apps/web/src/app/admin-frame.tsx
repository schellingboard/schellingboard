import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ApiClient } from "@schellingboard/api-client";
import { createAdminGate } from "../queries/admin-gate";
import { NoticeProvider } from "../ui/notices";
import { cx } from "../ui/cx";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkOutlineIcon,
} from "../ui/icons";
import { Footer } from "./footer";
import { hardNavigate } from "./hard-navigate";
import { useHealth } from "./health";
import { ThemeProvider } from "./theme";
import { useUpdateStatus } from "./updates";

const ReloadGate = createContext<() => void>(() => {});

/** Reads the gate again, so the header shows a title that a page just changed. */
export const useReloadAdminGate = () => useContext(ReloadGate);

const LOGIN = "/legacy/admin/login";

const LINKS = [
  { href: "/admin/events", label: "Events" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/settings", label: "Settings" },
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
      aria-label="Admin"
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
            {link.label}
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
      await fetch("/api/v1/auth/sign-out", { method: "POST" });
      const response = await fetch("/api/admin/logout", { method: "POST" });
      // Already signed out (an expired cookie) is the state logging out aims for.
      if (
        !response.ok &&
        response.status !== 401 &&
        response.status !== 403 &&
        response.status !== 404
      )
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
        {pending ? "Logging out..." : "Admin logout"}
      </button>
      {failed && (
        <span role="alert" className="text-sm text-bar-fg">
          Could not log out. Try again.
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
  return (
    <header className="bg-bar text-bar-fg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-3 py-3 lg:px-8">
        <a href="/admin" className="font-semibold hover:text-bar-fg-subtle">
          {title} Admin
        </a>
        <div className="hidden items-center gap-4 sm:flex">
          <NavLinks currentPath={currentPath} />
          <LogoutButton />
        </div>
        <button
          type="button"
          aria-label={open ? "Close admin menu" : "Open admin menu"}
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
 * browser to the admin login, which brings it back to `currentPath` after.
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
        <div className="flex min-h-dvh flex-col bg-surface text-fg">
          {state.status === "open" && (
            <AdminHeader title={state.title} currentPath={currentPath} />
          )}
          <main className="flex flex-1 flex-col px-3 py-6 lg:px-8 lg:pb-16">
            {state.status === "open" && (
              <ReloadGate.Provider value={reload}>
                {children}
              </ReloadGate.Provider>
            )}
            {state.status === "error" && (
              <p role="alert" className="text-sm text-danger-fg">
                Could not open the admin area ({state.code}).
              </p>
            )}
          </main>
          <Footer version={health?.version} update={update} />
        </div>
      </NoticeProvider>
    </ThemeProvider>
  );
}
