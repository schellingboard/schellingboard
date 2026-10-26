import { useId, useState } from "react";
import { Dialog } from "../ui/dialog";
import { hardNavigate, hardReload } from "./hard-navigate";
import { endSiteSession } from "./site-session";
import type { Viewer } from "./viewer";

export type PickableGuest = {
  id: string;
  name: string;
  authProtected: boolean;
};

const chip =
  "flex min-w-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-accent";
const item =
  "block w-full px-4 py-2 text-left text-sm text-fg-muted hover:bg-surface-muted hover:text-fg";

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
          aria-label="Your name"
          onClick={() => setPicking(true)}
          className={`${chip} bg-brand-tint text-brand-fg hover:bg-brand-tint-hover`}
        >
          Select your name
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

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Your name: ${current.name}`}
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
          aria-label="Your name"
          className="absolute right-0 z-40 mt-1 w-48 rounded-md bg-surface-raised py-1 shadow-lg ring-1 ring-line-subtle"
        >
          <a
            role="menuitem"
            href={`/legacy/guests/${current.id}`}
            className={item}
          >
            My profile
          </a>
          <a role="menuitem" href="/legacy/guests/edit" className={item}>
            Edit profile
          </a>
          <a role="menuitem" href="/legacy/settings" className={item}>
            Settings
          </a>
          <div className="my-1 h-px bg-surface-muted" />
          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            onClick={() => void logOut()}
            className={`${item} disabled:opacity-50`}
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
          {logoutFailed && (
            <p role="alert" className="px-4 py-1 text-xs text-danger-fg">
              Could not log out — try again
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
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const listId = useId();
  const shown = guests.filter((g) =>
    g.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const pick = async (guest: PickableGuest) => {
    setError(null);
    const result = await choose(guest.id);
    if (result.ok) return onClose();
    if (result.code === "guest.protected")
      return hardNavigate(`/legacy/auth/login?guest=${guest.id}`);
    setError("Could not select that name — try again");
  };

  return (
    <Dialog open={open} onClose={onClose} title="Who are you?">
      <label htmlFor={inputId} className="text-fg-subtle">
        My name is:
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded
        aria-controls={listId}
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-1 w-full rounded-md border border-line bg-surface-raised px-3 py-2 text-sm"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger-fg">
          {error}
        </p>
      )}
      <ul
        id={listId}
        role="listbox"
        aria-label="Names"
        className="mt-2 max-h-72 overflow-y-auto"
      >
        {shown.map((guest) => (
          <li
            key={guest.id}
            role="option"
            aria-selected={false}
            tabIndex={0}
            onClick={() => void pick(guest)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void pick(guest);
              }
            }}
            className={`${item} cursor-pointer`}
          >
            {guest.name}
            {guest.authProtected && (
              <span className="ml-2 text-xs text-fg-subtle">(password)</span>
            )}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
