import { useState, type FormEvent } from "react";
import type { SignInCalls } from "../../commands/sign-in";
import { Button } from "../../ui/button";
import { TextField } from "../../ui/form";
import { isRecentlySent, useCredentialForm } from "./use-credential-form";

/** With `guest` the form names whose login it is; without, the person types an email or username. */
export function GuestLoginForm({
  calls,
  guest,
  initialCredential = "",
  onSignedIn,
}: {
  calls: SignInCalls;
  guest?: { id: string; name: string };
  initialCredential?: string;
  onSignedIn: (guestId: string) => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [credential, setCredential] = useState(initialCredential);
  const [info, setInfo] = useState<string | null>(null);
  const target = guest
    ? { guestId: guest.id }
    : { identifier: identifier.trim() };
  const named = guest !== undefined || identifier.trim().length > 0;

  const logIn = useCredentialForm<{ guestId: string | null }>(() =>
    calls.logIn({ ...target, credential })
  );
  const code = useCredentialForm(() => calls.requestLoginCode(target));
  const link = useCredentialForm(() => calls.requestResetLink(target));
  const forms = [logIn, code, link];
  const error = info ? null : forms.map((f) => f.error).find(Boolean);

  const run = async (
    form: (typeof forms)[number],
    sent: string
  ): Promise<void> => {
    forms.forEach((f) => f.reset());
    setInfo(null);
    const result = await form.submit();
    if (result?.ok) setInfo(sent);
    else if (result && !result.ok && isRecentlySent(result))
      setInfo(result.message);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    forms.forEach((f) => f.reset());
    setInfo(null);
    const result = await logIn.submit();
    if (result?.ok && result.data?.guestId) onSignedIn(result.data.guestId);
  };

  const busy = forms.some((f) => f.pending);

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-2">
      <p className="text-sm text-fg-muted">
        {guest
          ? "This user has protected their account. Enter their password, or use a single-use code emailed to them. Forgot the password? Reset it instead."
          : "Enter your password, or a single-use code emailed to you. Forgot the password? Reset it instead."}
      </p>
      {guest ? (
        <TextField
          label="Logging in as"
          name="username"
          value={guest.name}
          onChange={() => {}}
          readOnly
          autoComplete="username"
        />
      ) : (
        <TextField
          label="Email or username"
          name="username"
          value={identifier}
          onChange={setIdentifier}
          autoComplete="username"
        />
      )}
      <TextField
        label="Password or emailed code"
        type="password"
        value={credential}
        onChange={setCredential}
        autoComplete="current-password"
      />
      {error && (
        <p role="alert" className="text-sm text-danger-fg">
          {error}
        </p>
      )}
      {info && (
        <p role="status" className="text-sm text-success-fg">
          {info}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="submit"
          disabled={busy || !named || credential.length === 0}
        >
          Log in
        </Button>
        <Button
          variant="quiet"
          disabled={busy || !named}
          onClick={() => void run(code, "Code sent — check your email")}
        >
          Email me a code
        </Button>
        <Button
          variant="quiet"
          disabled={busy || !named}
          onClick={() =>
            void run(
              link,
              "Reset link sent — check your email to set a new password"
            )
          }
        >
          Forgot your password?
        </Button>
      </div>
    </form>
  );
}

/** The emailed-link landing page: whose name the code is for, or why the link is no good. */
export function LoginScreen({
  calls,
  guest,
  code,
  onSignedIn,
}: {
  calls: SignInCalls;
  /** `undefined`: a plain sign-in; `null`: the link names nobody. */
  guest: { id: string; name: string } | null | undefined;
  code?: string;
  onSignedIn: (guestId: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 sm:px-0">
      {guest === null ? (
        <p className="text-fg-muted">
          This login link is invalid. Request a new code from the name selector
          or your settings page.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-bold">
            {guest ? `Log in as ${guest.name}` : "Log in"}
          </h1>
          <GuestLoginForm
            calls={calls}
            guest={guest}
            initialCredential={code}
            onSignedIn={onSignedIn}
          />
        </>
      )}
    </div>
  );
}
