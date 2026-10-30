import { useState, type FormEvent } from "react";
import type { SignInCalls } from "../../commands/sign-in";
import { Button } from "../../ui/button";
import { TextField } from "../../ui/form";
import { PasswordManagerHint } from "../../ui/password-manager-hint";
import { useCredentialForm } from "./use-credential-form";

/**
 * Sets a new password from an emailed link. It signs no one in, so on success
 * it points at the sign-in.
 */
function ResetPasswordForm({
  calls,
  guest,
  token,
  signInHref,
  onPasswordSet,
}: {
  calls: SignInCalls;
  guest: { id: string; name: string };
  token: string;
  signInHref: string;
  onPasswordSet?: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [done, setDone] = useState(false);
  const mutation = useCredentialForm(() =>
    calls.resetPassword({ guestId: guest.id, token, newPassword })
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await mutation.submit();
    if (result?.ok) {
      setDone(true);
      onPasswordSet?.();
    }
  };

  if (done)
    return (
      <div className="flex flex-col gap-3">
        <p role="status" className="text-sm text-success-fg">
          Password set. Your name is now protected — log in with your new
          password.
        </p>
        <a
          href={signInHref}
          className="self-start rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-on-brand hover:bg-brand-hover"
        >
          Go to sign in
        </a>
      </div>
    );

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-2">
      <p className="text-sm text-fg-muted">
        Choose a new password. You&apos;ll use it to switch to your name from
        now on.
      </p>
      <PasswordManagerHint username={guest.name} />
      <TextField
        label="New password (at least 8 characters)"
        type="password"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
        error={mutation.fields.newPassword}
      />
      {mutation.error && !mutation.fields.newPassword && (
        <p role="alert" className="text-sm text-danger-fg">
          {mutation.error}
        </p>
      )}
      <div>
        <Button
          type="submit"
          disabled={mutation.pending || newPassword.length === 0}
        >
          Set password
        </Button>
      </div>
    </form>
  );
}

/** The reset-link landing page: the form for the named guest, or why the link is no good. */
export function ResetScreen({
  calls,
  guest,
  token,
  signInHref,
  onPasswordSet,
}: {
  calls: SignInCalls;
  guest: { id: string; name: string } | null;
  token: string | undefined;
  signInHref: string;
  onPasswordSet?: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 sm:px-0">
      {guest && token ? (
        <>
          <h1 className="text-2xl font-bold">
            Set a password for {guest.name}
          </h1>
          <ResetPasswordForm
            calls={calls}
            guest={guest}
            token={token}
            signInHref={signInHref}
            onPasswordSet={onPasswordSet}
          />
        </>
      ) : (
        <p className="text-fg-muted">
          This password link is invalid. Request a new one from the name
          selector or your settings page.
        </p>
      )}
    </div>
  );
}
