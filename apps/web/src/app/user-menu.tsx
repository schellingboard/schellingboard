import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { Dialog } from "../ui/dialog";
import { hardNavigate, hardReload } from "./hard-navigate";
import { endSiteSession } from "./site-session";
import type { Viewer } from "./viewer";
import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";

export type PickableGuest = {
  id: string;
  name: string;
  authProtected: boolean;
};

const chip =
  "flex min-w-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-accent";
const item =
  "block w-full px-4 py-2 text-left text-sm text-fg-muted hover:bg-surface-muted hover:text-fg";

const optionBase = "block w-full cursor-pointer px-4 py-2 text-left text-sm";

export function UserMenu({
  viewer,
  guests,
}: {
  viewer: Viewer;
  guests: PickableGuest[] | undefined;
}) {
  const [picking, setPicking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);

  if (viewer.guestId === undefined || guests === undefined) return null;
  const current = guests.find((g) => g.id === viewer.guestId);

  const logOut = async () => {
    setLoggingOut(true);
    setLogoutFailed(false);
    try {
      await viewer.signOut();
      await endSiteSession();
    } catch {
      setLoggingOut(false);
      setLogoutFailed(true);
      return;
    }
    hardReload();
  };

  if (!current) {
    return (
      <>
        <button
          type="button"
          aria-label={t`Your name`}
          onClick={() => setPicking(true)}
          className={`${chip} bg-brand-tint text-brand-fg hover:bg-brand-tint-hover`}
        >
          {t`Select your name`}
        </button>
        <NamePicker
          open={picking}
          onClose={() => setPicking(false)}
          guests={guests}
          choose={viewer.choose}
        />
      </>
    );
  }

  const name = current.name;
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t`Your name: ${name}`}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
        className={`${chip} text-fg-muted hover:bg-surface-muted`}
      >
        <span className="max-w-[40vw] truncate sm:max-w-[12rem]">
          {current.name}
        </span>
      </button>
      {menuOpen && (
        <div
          role="menu"
          aria-label={t`Your name`}
          className="absolute right-0 z-40 mt-1 w-48 rounded-md bg-surface-raised py-1 shadow-lg ring-1 ring-line-subtle"
        >
          <a
            role="menuitem"
            href={`/guests/${current.id}`}
            className={item}
            onClick={() => setMenuOpen(false)}
          >
            {t`My profile`}
          </a>
          <a
            role="menuitem"
            href="/guests/edit"
            className={item}
            onClick={() => setMenuOpen(false)}
          >
            {t`Edit profile`}
          </a>
          <a
            role="menuitem"
            href="/settings"
            className={item}
            onClick={() => setMenuOpen(false)}
          >
            {t`Settings`}
          </a>
          <a
            role="menuitem"
            href="/comments"
            className={item}
            onClick={() => setMenuOpen(false)}
          >
            {t`My comments`}
          </a>
          <div className="my-1 h-px bg-surface-muted" />
          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            onClick={() => void logOut()}
            className={`${item} disabled:opacity-50`}
          >
            {loggingOut ? t`Logging out...` : t`Log out`}
          </button>
          {logoutFailed && (
            <p role="alert" className="px-4 py-1 text-xs text-danger-fg">
              {t`Could not log out — try again`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function NamePicker({
  open,
  onClose,
  guests,
  choose,
}: {
  open: boolean;
  onClose: () => void;
  guests: PickableGuest[];
  choose: Viewer["choose"];
}) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<MessageDescriptor | null>(null);
  const inputId = useId();
  const listId = useId();
  const [active, setActive] = useState(-1);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    setActive(-1);
  }
  const shown = guests.filter((g) =>
    g.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  const activeId = shown[active] ? `${listId}-${active}` : undefined;

  useEffect(() => {
    if (activeId)
      document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
  }, [activeId]);

  const pick = async (guest: PickableGuest) => {
    setError(null);
    const result = await choose(guest.id);
    if (result.ok) return onClose();
    if (result.code === "guest.protected")
      return hardNavigate(`/auth/login?guest=${guest.id}`);
    setError(msg`Could not select that name — try again`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = shown.length - 1;
    if (last < 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) =>
        a < 0 ? (step > 0 ? 0 : last) : (a + step + shown.length) % shown.length
      );
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : last);
    } else if (
      e.key === "Enter" &&
      shown[active] &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      void pick(shown[active]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t`Who are you?`}>
      <label htmlFor={inputId} className="text-fg-subtle">
        {t`My name is:`}
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        autoFocus
        value={query}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(e.target.value.trim() ? 0 : -1);
        }}
        className="mt-1 w-full rounded-md border border-line bg-surface-raised px-3 py-2 text-sm"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger-fg">
          {i18n._(error)}
        </p>
      )}
      <ul
        id={listId}
        role="listbox"
        aria-label={t`Names`}
        className="mt-2 max-h-72 overflow-y-auto"
      >
        {shown.map((guest, i) => (
          <li
            key={guest.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            tabIndex={-1}
            onClick={() => void pick(guest)}
            onMouseMove={() => setActive(i)}
            className={`${optionBase} ${i === active ? "bg-surface-muted text-fg" : "text-fg-muted"}`}
          >
            {guest.name}
            {guest.authProtected && (
              <span className="ml-2 text-xs text-fg-subtle">{t`(password)`}</span>
            )}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
