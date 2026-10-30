import { useState, type FormEvent } from "react";
import type { SignInCalls } from "../../commands/sign-in";
import type {
  AccountSecurityState,
  LoginSessionView,
} from "../../queries/account-security";
import { Button } from "../../ui/button";
import { TextField } from "../../ui/form";
import { PasswordManagerHint } from "../../ui/password-manager-hint";
import { isRecentlySent, useCredentialForm } from "./use-credential-form";

type Ready = Extract<AccountSecurityState, { status: "ready" }>;
type Guest = { id: string; name: string };
type Mode = "password" | "disable";

const SECTION = "flex flex-col gap-2";

/** Protection, username and signed-in browsers of the guest this browser acts as. */
export function AccountSecurityScreen({
  state,
  calls,
  guest,
  reload,
  backHref,
}: {
  state: AccountSecurityState;
  calls: SignInCalls;
  guest: Guest;
  reload: () => void;
  backHref: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 sm:px-0">
      <a href={backHref} className="text-sm text-fg-subtle hover:text-fg-muted">
        ← Settings
      </a>
      <h1 className="text-2xl font-bold">Account security</h1>
      {state.status === "loading" && <p role="status">Loading…</p>}
      {state.status === "error" && (
        <p role="alert" className="text-danger-fg">
          {state.code.startsWith("guest.")
            ? "Choose who you are, and log in if your name is protected, to change your security settings."
            : "Could not load your security settings. Reload the page to try again."}
        </p>
      )}
      {state.status === "ready" && (
        <>
          <Protection
            state={state}
            calls={calls}
            guest={guest}
            reload={reload}
          />
          <Username state={state} calls={calls} reload={reload} />
          <LoginSessions state={state} calls={calls} reload={reload} />
        </>
      )}
    </div>
  );
}

function Protection({
  state,
  calls,
  guest,
  reload,
}: {
  state: Ready;
  calls: SignInCalls;
  guest: Guest;
  reload: () => void;
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const change = useCredentialForm((key) =>
    mode === "disable"
      ? calls.unprotect({ currentPassword })
      : calls.changePassword({ currentPassword, newPassword }, key)
  );
  const link = useCredentialForm(() =>
    calls.requestResetLink({ guestId: guest.id })
  );

  const start = (next: Mode) => {
    setMode(next);
    setCurrentPassword("");
    setNewPassword("");
    setDone(null);
    setInfo(null);
    change.reset();
  };

  const sendLink = async () => {
    setDone(null);
    setInfo(null);
    const result = await link.submit();
    if (result?.ok) setInfo("Check your email for a link to set your password");
    else if (result && !result.ok && isRecentlySent(result))
      setInfo(result.message);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await change.submit();
    if (!result?.ok) return;
    setDone(mode === "disable" ? "Protection turned off" : "Password changed");
    setMode(null);
    reload();
  };

  return (
    <section className={SECTION} aria-labelledby="protection-heading">
      <h2 id="protection-heading" className="text-lg font-semibold">
        Protection
      </h2>
      <p className="text-sm text-fg-subtle">
        {state.authProtected
          ? "Your name is protected: switching to it requires your password or a single-use code emailed to you. Forgot your password? Reset it with an emailed link."
          : "Anyone can currently act under your name. Enable protection so switching to your name requires your password. We'll email you a link to set it."}
      </p>
      {done && (
        <p role="status" className="text-sm text-success-fg">
          {done}
        </p>
      )}
      {mode === null ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {state.authProtected ? (
              <>
                <Button onClick={() => start("password")}>
                  Change password
                </Button>
                <Button
                  variant="quiet"
                  disabled={link.pending}
                  onClick={() => void sendLink()}
                >
                  Forgot your password?
                </Button>
                <Button variant="quiet" onClick={() => start("disable")}>
                  Turn off protection
                </Button>
              </>
            ) : (
              <Button disabled={link.pending} onClick={() => void sendLink()}>
                Enable protection
              </Button>
            )}
          </div>
          {info && (
            <p role="status" className="text-sm text-success-fg">
              {info}
            </p>
          )}
          {!info && link.error && (
            <p role="alert" className="text-sm text-danger-fg">
              {link.error}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={(e) => void submit(e)} className={SECTION}>
          <p className="text-sm text-fg-muted">
            {mode === "password"
              ? "Enter your current password and choose a new one."
              : "Enter your current password to turn off protection. This also removes your password."}
          </p>
          <PasswordManagerHint username={guest.name} />
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          {mode === "password" && (
            <TextField
              label="New password (at least 8 characters)"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              error={change.fields.newPassword}
            />
          )}
          {change.error && !change.fields.newPassword && (
            <p role="alert" className="text-sm text-danger-fg">
              {change.error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              disabled={
                change.pending ||
                currentPassword.length === 0 ||
                (mode === "password" && newPassword.length === 0)
              }
            >
              {mode === "password" ? "Change password" : "Turn off protection"}
            </Button>
            <Button
              variant="quiet"
              disabled={change.pending}
              onClick={() => setMode(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

function Username({
  state,
  calls,
  reload,
}: {
  state: Ready;
  calls: SignInCalls;
  reload: () => void;
}) {
  const [username, setUsername] = useState(state.username ?? "");
  const [saved, setSaved] = useState(false);
  const mutation = useCredentialForm((key) =>
    calls.setUsername({ username: username.trim() || null }, key)
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const result = await mutation.submit();
    if (!result?.ok) return;
    setSaved(true);
    reload();
  };

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className={SECTION}
      aria-label="Username settings"
    >
      <h2 className="text-lg font-semibold">Username</h2>
      <TextField
        label="Username"
        value={username}
        onChange={(value) => {
          setUsername(value);
          setSaved(false);
        }}
        autoComplete="off"
        hint="Optional. Besides your email, you can log in with it and your password. Leave it empty to have none."
        error={mutation.fields.username}
      />
      {mutation.error && !mutation.fields.username && (
        <p role="alert" className="text-sm text-danger-fg">
          {mutation.error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={mutation.pending}>
          Save username
        </Button>
        {saved && (
          <span role="status" className="text-sm text-success-fg">
            Username saved
          </span>
        )}
      </div>
    </form>
  );
}

function LoginSessions({
  state,
  calls,
  reload,
}: {
  state: Ready;
  calls: SignInCalls;
  reload: () => void;
}) {
  const [ended, setEnded] = useState<string[]>([]);
  const [revoking, setRevoking] = useState<string[]>([]);
  const [failure, setFailure] = useState<string | null>(null);
  const revoke = async (session: LoginSessionView) => {
    setFailure(null);
    setRevoking((ids) => [...ids, session.id]);
    const result = await calls
      .revokeLoginSession(session.id, crypto.randomUUID())
      .then((r) => r.response.ok)
      .catch(() => false);
    setRevoking((ids) => ids.filter((id) => id !== session.id));
    if (!result) {
      setFailure("Could not sign that browser out. Try again.");
      return;
    }
    setEnded([...ended, session.id]);
    reload();
  };
  const shown = state.sessions.filter((s) => !ended.includes(s.id));

  return (
    <section className={SECTION} aria-labelledby="sessions-heading">
      <h2 id="sessions-heading" className="text-lg font-semibold">
        Signed-in browsers
      </h2>
      <p className="text-sm text-fg-subtle">
        Each browser you chose your name in stays signed in for 30 days after
        you last used it.
      </p>
      <ul aria-label="Signed-in browsers" className="flex flex-col gap-2">
        {shown.map((session) => {
          const label = session.device ?? "unknown browser";
          return (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line p-2 text-sm"
            >
              <span>
                {label}
                {session.current && " (This browser)"} · last used{" "}
                {new Date(session.lastSeenAt).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
              {!session.current && (
                <Button
                  variant="quiet"
                  aria-label={`Sign out ${label}`}
                  disabled={revoking.includes(session.id)}
                  onClick={() => void revoke(session)}
                >
                  Sign out
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {failure && (
        <p role="alert" className="text-sm text-danger-fg">
          {failure}
        </p>
      )}
    </section>
  );
}
