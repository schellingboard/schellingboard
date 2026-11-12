import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type FormEvent, useEffect, useRef, useState } from "react";

import type { SignInCalls } from "../../commands/sign-in";
import { useFormatLocale } from "../../i18n/format-locale";
import type {
  AccountSecurityState,
  LoginSessionView,
} from "../../queries/account-security";
import { useEmailEnabled } from "../../queries/email-enabled";
import { Button } from "../../ui/button";
import { TextField } from "../../ui/form";
import { PasswordManagerHint } from "../../ui/password-manager-hint";
import { isRecentlySent, useCredentialForm } from "./use-credential-form";

type Ready = Extract<AccountSecurityState, { status: "ready" }>;
type Guest = { id: string; name: string };
type Mode = "password" | "disable" | "first";

const SECTION = "flex flex-col gap-2";

/** Protection, username and signed-in browsers of the guest this browser acts as. */
export function AccountSecuritySection({
  state,
  calls,
  guest,
  reload,
}: {
  state: AccountSecurityState;
  calls: SignInCalls;
  guest: Guest;
  reload: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  // Again once loaded: what lands above the section while it loads moves it.
  useEffect(() => {
    if (window.location.hash === "#security") root.current?.scrollIntoView();
  }, [state.status]);

  return (
    <section
      ref={root}
      id="security"
      aria-labelledby="security-heading"
      className="mx-auto flex w-full max-w-2xl scroll-mt-20 flex-col gap-6 px-4 sm:px-0"
    >
      <h2 id="security-heading" className="text-xl font-bold">
        <Trans>Account security</Trans>
      </h2>
      {state.status === "loading" && (
        <p role="status">
          <Trans>Loading…</Trans>
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-danger-fg">
          {state.code.startsWith("guest.")
            ? t`Choose who you are, and log in if your name is protected, to change your security settings.`
            : t`Could not load your security settings. Reload the page to try again.`}
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
    </section>
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
  const [done, setDone] = useState<MessageDescriptor | null>(null);
  const [info, setInfo] = useState<MessageDescriptor | string | null>(null);

  const emailEnabled = useEmailEnabled(calls.emailEnabled);
  const canResetByMail = emailEnabled === true && state.hasEmail;
  const canSetDirectly = state.canSetPassword;

  const change = useCredentialForm((key) =>
    mode === "disable"
      ? calls.unprotect({ currentPassword })
      : mode === "first"
        ? calls.setPassword({ newPassword }, key)
        : calls.changePassword({ currentPassword, newPassword }, key)
  );
  const link = useCredentialForm(() =>
    calls.requestResetLink({ guestId: guest.id })
  );

  const openProtectionForm = (next: Mode) => {
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
    if (result?.ok)
      setInfo(msg`Check your email for a link to set your password`);
    else if (result && !result.ok && isRecentlySent(result))
      setInfo(result.message);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await change.submit();
    if (!result?.ok) return;
    setDone(
      mode === "disable"
        ? msg`Protection turned off`
        : mode === "first"
          ? msg`Password set`
          : msg`Password changed`
    );
    setMode(null);
    reload();
  };

  return (
    <section className={SECTION} aria-labelledby="protection-heading">
      <h3 id="protection-heading" className="text-lg font-semibold">
        <Trans>Protection</Trans>
      </h3>
      <p className="text-sm text-fg-subtle">
        {state.authProtected
          ? canResetByMail
            ? t`Your name is protected: switching to it requires your password or a single-use code emailed to you. Forgot your password? Reset it with an emailed link.`
            : t`Your name is protected: switching to it requires your password. Forgot it? Ask an organizer for a new link, then set a new password here.`
          : canResetByMail
            ? t`Anyone can currently act under your name. Enable protection so switching to your name requires your password. We'll email you a link to set it.`
            : t`Anyone can currently act under your name. Protect it so switching to your name requires your password.`}
      </p>
      {done && (
        <p role="status" className="text-sm text-success-fg">
          {i18n._(done)}
        </p>
      )}
      {mode === null ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {state.authProtected ? (
              <>
                <Button onClick={() => openProtectionForm("password")}>
                  <Trans>Change password</Trans>
                </Button>
                {canResetByMail && (
                  <Button
                    variant="quiet"
                    disabled={link.pending}
                    onClick={() => void sendLink()}
                  >
                    <Trans>Forgot your password?</Trans>
                  </Button>
                )}
                {canSetDirectly && (
                  <Button
                    variant="quiet"
                    onClick={() => openProtectionForm("first")}
                  >
                    <Trans>Set a new password</Trans>
                  </Button>
                )}
                <Button
                  variant="quiet"
                  onClick={() => openProtectionForm("disable")}
                >
                  <Trans>Turn off protection</Trans>
                </Button>
              </>
            ) : canSetDirectly ? (
              <Button onClick={() => openProtectionForm("first")}>
                <Trans>Set a password</Trans>
              </Button>
            ) : (
              canResetByMail && (
                <Button disabled={link.pending} onClick={() => void sendLink()}>
                  <Trans>Enable protection</Trans>
                </Button>
              )
            )}
          </div>
          {info && (
            <p role="status" className="text-sm text-success-fg">
              {typeof info === "string" ? info : i18n._(info)}
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
            {mode === "first"
              ? t`Choose a password. You are signed in with your personal link, so the old one is not needed.`
              : mode === "password"
                ? t`Enter your current password and choose a new one.`
                : t`Enter your current password to turn off protection. This also removes your password.`}
          </p>
          <PasswordManagerHint username={guest.name} />
          {mode !== "first" && (
            <TextField
              label={t`Current password`}
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
          )}
          {mode !== "disable" && (
            <TextField
              label={t`New password (at least 8 characters)`}
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
                (mode !== "first" && currentPassword.length === 0) ||
                (mode !== "disable" && newPassword.length === 0)
              }
            >
              {mode === "disable"
                ? t`Turn off protection`
                : mode === "first"
                  ? t`Set password`
                  : t`Change password`}
            </Button>
            <Button
              variant="quiet"
              disabled={change.pending}
              onClick={() => setMode(null)}
            >
              <Trans>Cancel</Trans>
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
      aria-label={t`Username settings`}
    >
      <h3 className="text-lg font-semibold">
        <Trans>Username</Trans>
      </h3>
      <TextField
        label={t`Username`}
        value={username}
        onChange={(value) => {
          setUsername(value);
          setSaved(false);
        }}
        autoComplete="off"
        hint={t`Optional. Besides your email, you can log in with it and your password. Leave it empty to have none.`}
        error={mutation.fields.username}
      />
      {mutation.error && !mutation.fields.username && (
        <p role="alert" className="text-sm text-danger-fg">
          {mutation.error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={mutation.pending}>
          <Trans>Save username</Trans>
        </Button>
        {saved && (
          <span role="status" className="text-sm text-success-fg">
            <Trans>Username saved</Trans>
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
  const locale = useFormatLocale();
  const [ended, setEnded] = useState<string[]>([]);
  const [revoking, setRevoking] = useState<string[]>([]);
  const [failure, setFailure] = useState<MessageDescriptor | null>(null);
  const revoke = async (session: LoginSessionView) => {
    setFailure(null);
    setRevoking((ids) => [...ids, session.id]);
    const result = await calls
      .revokeLoginSession(session.id, crypto.randomUUID())
      .then((r) => r.response.ok)
      .catch(() => false);
    setRevoking((ids) => ids.filter((id) => id !== session.id));
    if (!result) {
      setFailure(msg`Could not sign that browser out. Try again.`);
      return;
    }
    setEnded([...ended, session.id]);
    reload();
  };
  const shown = state.sessions.filter((s) => !ended.includes(s.id));

  return (
    <section className={SECTION} aria-labelledby="sessions-heading">
      <h3 id="sessions-heading" className="text-lg font-semibold">
        <Trans>Signed-in browsers</Trans>
      </h3>
      <p className="text-sm text-fg-subtle">
        <Trans>
          Each browser you chose your name in stays signed in for 30 days after
          you last used it.
        </Trans>
      </p>
      <ul aria-label={t`Signed-in browsers`} className="flex flex-col gap-2">
        {shown.map((session) => {
          const device = session.device;
          const lastUsed = new Date(session.lastSeenAt).toLocaleDateString(
            locale,
            { dateStyle: "medium" }
          );
          return (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line p-2 text-sm"
            >
              <span>
                {session.current
                  ? device
                    ? t({
                        message: `${device} (This browser) · last used ${lastUsed}`,
                        comment:
                          "{device} is the browser or device name, {lastUsed} a date",
                      })
                    : t`Unknown browser (This browser) · last used ${lastUsed}`
                  : device
                    ? t({
                        message: `${device} · last used ${lastUsed}`,
                        comment:
                          "{device} is the browser or device name, {lastUsed} a date",
                      })
                    : t`Unknown browser · last used ${lastUsed}`}
              </span>
              {!session.current && (
                <Button
                  variant="quiet"
                  aria-label={
                    device
                      ? t({
                          message: `Sign out ${device}`,
                          comment: "{device} is the browser or device name",
                        })
                      : t`Sign out unknown browser`
                  }
                  disabled={revoking.includes(session.id)}
                  onClick={() => void revoke(session)}
                >
                  <Trans>Sign out</Trans>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {failure && (
        <p role="alert" className="text-sm text-danger-fg">
          {i18n._(failure)}
        </p>
      )}
    </section>
  );
}
