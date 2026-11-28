import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type FormEvent, useState } from "react";

import type { SignInCalls } from "../../commands/sign-in";
import { Button } from "../../ui/button";
import { SearchableSelectField, TextField } from "../../ui/form";
import { PasswordManagerHint } from "../../ui/password-manager-hint";
import { useCredentialForm } from "./use-credential-form";

const NEW = "new";
const ADMINS_OFF = "bootstrap.proxyAdminsOff";

/** The page of the one-time link that makes its visitor a site admin. */
export function BootstrapScreen({
  calls,
  token,
  guests,
  proxyPerson,
  onBootstrapped,
}: {
  calls: SignInCalls;
  token: string | undefined;
  guests: { id: string; name: string }[];
  /** Set when a sign-in proxy decides who the visitor is; `name` may be unknown. */
  proxyPerson?: { name?: string };
  onBootstrapped: () => void;
}) {
  const [who, setWho] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminsOff, setAdminsOff] = useState(false);
  const asProxyPerson = proxyPerson !== undefined;
  const person =
    who === NEW ? { name: name.trim(), email: email.trim() } : { guestId: who };
  const mutation = useCredentialForm(() =>
    calls.bootstrap(
      asProxyPerson
        ? { token: token ?? "" }
        : { token: token ?? "", ...person, username, password }
    )
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await mutation.submit();
    if (result?.ok) onBootstrapped();
    else if (result?.kind === "refused")
      setAdminsOff(result.code === ADMINS_OFF);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 sm:px-0">
      <h1 className="text-2xl font-bold">
        <Trans>Become a site admin</Trans>
      </h1>
      {token && proxyPerson ? (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex flex-col gap-3"
        >
          <p className="text-sm text-fg-muted">
            {proxyPerson.name ? (
              <Trans>
                The sign-in proxy identifies you as {proxyPerson.name}. This
                one-time link makes you a site admin; you need no username or
                password.
              </Trans>
            ) : (
              <Trans>
                The sign-in proxy identifies you. This one-time link makes you a
                site admin; you need no username or password.
              </Trans>
            )}
          </p>
          {adminsOff ? (
            <p role="alert" className="text-sm text-danger-fg">
              <Trans>
                Site admins do not sign in through the proxy, so this link would
                not let you in. Ask whoever runs the server to start it with
                SB_DISABLE_PROXY_SIGN_IN=1 and use the link again.
              </Trans>
            </p>
          ) : (
            mutation.error && (
              <p role="alert" className="text-sm text-danger-fg">
                {mutation.error}
              </p>
            )
          )}
          <div>
            <Button type="submit" disabled={mutation.pending}>
              <Trans>Become site admin</Trans>
            </Button>
          </div>
        </form>
      ) : token ? (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex flex-col gap-2"
        >
          <p className="text-sm text-fg-muted">
            <Trans>
              This one-time link makes you a site admin. Choose who you are, or
              add yourself, then set a username and password.
            </Trans>
          </p>
          <SearchableSelectField
            label={t`Who are you?`}
            placeholder={t`Choose…`}
            value={who}
            onChange={setWho}
            options={[
              { value: NEW, label: t`Someone new` },
              ...guests.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
          {who === NEW && (
            <>
              <TextField
                label={t`Name`}
                value={name}
                onChange={setName}
                autoComplete="name"
                error={mutation.fields.name}
              />
              <TextField
                label={t`Email`}
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                error={mutation.fields.email}
              />
            </>
          )}
          <PasswordManagerHint username={username} />
          <TextField
            label={t`Username`}
            value={username}
            onChange={setUsername}
            autoComplete="username"
            error={mutation.fields.username}
          />
          <TextField
            label={t`Password (at least 8 characters)`}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            error={mutation.fields.password}
          />
          {mutation.error && Object.keys(mutation.fields).length === 0 && (
            <p role="alert" className="text-sm text-danger-fg">
              {mutation.error}
            </p>
          )}
          <div>
            <Button
              type="submit"
              disabled={
                mutation.pending ||
                who === "" ||
                username === "" ||
                password === ""
              }
            >
              <Trans>Become site admin</Trans>
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-fg-muted">
          <Trans>
            This link is invalid. Ask whoever runs the site for a new one.
          </Trans>
        </p>
      )}
    </div>
  );
}
