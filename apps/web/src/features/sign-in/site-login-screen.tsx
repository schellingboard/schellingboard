import { useState, type FormEvent } from "react";
import type { SignInCalls } from "../../commands/sign-in";
import { Button } from "../../ui/button";
import { TextField } from "../../ui/form";
import { PasswordManagerHint } from "../../ui/password-manager-hint";
import { useCredentialForm } from "./use-credential-form";

/** Where a visitor without the site cookie enters the shared site password. */
export function SiteLoginScreen({
  calls,
  onEntered,
}: {
  calls: SignInCalls;
  onEntered: () => void;
}) {
  const [password, setPassword] = useState("");
  const enter = useCredentialForm(() => calls.enterSite({ password }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await enter.submit();
    if (result?.ok) onEntered();
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-fg">Access Required</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Please enter the password to access this site
        </p>
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-6">
        <PasswordManagerHint username="Site Password" />
        <TextField
          label="Password"
          hideLabel
          type="password"
          placeholder="Enter password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={setPassword}
        />
        {enter.error && (
          <p role="alert" className="text-sm text-danger-fg">
            {enter.error}
          </p>
        )}
        <Button
          type="submit"
          className="w-full py-3"
          disabled={enter.pending || password.length === 0}
        >
          Access Site
        </Button>
      </form>
    </div>
  );
}
