import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type FormEvent, useState } from "react";

import type { AdminProxySignInCalls } from "../../commands/admin-proxy-sign-in";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { ProxySignInSettings } from "../../queries/admin-proxy-sign-in";
import { Button } from "../../ui/button";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { CheckboxField, TextAreaField, TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { ExclamationTriangleIcon } from "../../ui/icons";
import { jumpTo, shown } from "./use-section-save";

/* eslint-disable lingui/no-unlocalized-strings -- error codes and field names */
const REFUSED_FIELD: Record<string, string> = {
  "settings.proxyHeaderInvalid": "headerName",
  "settings.proxyAddressInvalid": "addresses",
  "settings.proxyLogoutUrlInvalid": "logoutUrl",
  "settings.proxyNameHeaderInvalid": "nameHeader",
};
/* eslint-enable lingui/no-unlocalized-strings */

function OwnRequest({ settings }: { settings: ProxySignInSettings }) {
  const own = settings.ownRequest;
  if (!own) return null;
  const header = settings.headerName;
  return (
    <p role="status" className="text-sm text-fg-muted">
      {!own.headerSeen ? (
        <Trans>
          Your request to this page carried no {header} header. Check that the
          proxy sends it.
        </Trans>
      ) : own.trusted ? (
        <Trans>
          Your request to this page carried the header and was trusted.
        </Trans>
      ) : (
        <Trans>
          Your request to this page carried the header, but it did not pass the
          secret or address check, so it is ignored.
        </Trans>
      )}
    </p>
  );
}

const REPLACE = "replace";
const REMOVE = "remove";
type Confirming = typeof REPLACE | typeof REMOVE;

function SecretSection({
  settings,
  calls,
  onChanged,
}: {
  settings: ProxySignInSettings;
  calls: AdminProxySignInCalls;
  onChanged: () => void;
}) {
  const [secret, setSecret] = useState<string>();
  const [removed, setRemoved] = useState(false);
  const [copy, setCopy] = useState<boolean>();
  const [confirming, setConfirming] = useState<Confirming>();
  const make = useFormMutation<{ secret: string }>({
    call: (key) => calls.makeSecret(key),
    explainRefusals: true,
  });
  const remove = useFormMutation({
    call: (key) => calls.removeSecret(key),
    explainRefusals: true,
  });

  const makeSecret = async () => {
    setConfirming(undefined);
    setRemoved(false);
    setCopy(undefined);
    const result = await make.submit();
    if (result?.ok && result.data) {
      setSecret(result.data.secret);
      onChanged();
    }
  };
  const removeSecret = async () => {
    setConfirming(undefined);
    setSecret(undefined);
    const result = await remove.submit();
    if (result?.ok) {
      setRemoved(true);
      onChanged();
    }
  };
  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret ?? "");
      setCopy(true);
    } catch {
      setCopy(false);
    }
  };

  const opensSite = settings.enabled && settings.addresses.length === 0;
  const confirmMessage =
    confirming === REPLACE
      ? t`Replace the secret? The proxy sign-in stops working until the proxy has the new secret.`
      : opensSite
        ? t`Anyone who reaches the app without the proxy can send the header and become any person. Set a secret or proxy addresses, unless no other path to the app exists.`
        : t`Remove the secret? The proxy no longer needs to send it, so only the proxy addresses protect the sign-in.`;

  return (
    <div className="space-y-2">
      <h3 className="font-medium">
        <Trans>Secret</Trans>
      </h3>
      <p className="text-sm text-fg-subtle">
        <Trans>
          The proxy sends the secret in the X-SchellingBoard-Proxy-Secret
          header. Requests without it are not signed in.
        </Trans>
      </p>
      <p className="text-sm">
        {settings.secretSet ? (
          <Trans>A secret is set.</Trans>
        ) : (
          <Trans>No secret is set.</Trans>
        )}
      </p>
      {secret && (
        <div className="space-y-1">
          <p className="text-sm text-fg-subtle">
            <Trans>
              Copy the secret now. It is shown only once; the app keeps only a
              fingerprint.
            </Trans>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="break-all rounded bg-surface-muted px-2 py-1">
              {secret}
            </code>
            <Button variant="quiet" onClick={() => void copySecret()}>
              <Trans>Copy secret</Trans>
            </Button>
            <span role="status" className="text-sm text-fg-muted">
              {copy === true && <Trans>Secret copied</Trans>}
              {copy === false && <Trans>Could not copy the secret</Trans>}
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="quiet"
          className="border border-line"
          disabled={make.pending}
          onClick={() =>
            settings.secretSet ? setConfirming(REPLACE) : void makeSecret()
          }
        >
          {settings.secretSet ? t`Replace secret` : t`Make secret`}
        </Button>
        {settings.secretSet && (
          <Button
            variant="quiet"
            className="border border-line"
            disabled={remove.pending}
            onClick={() => setConfirming(REMOVE)}
          >
            <Trans>Remove secret</Trans>
          </Button>
        )}
        {removed && (
          <p role="status" className="text-sm text-success-fg">
            <Trans>Secret removed.</Trans>
          </p>
        )}
      </div>
      <ConfirmDialog
        open={confirming !== undefined}
        title={confirming === REMOVE ? t`Remove secret` : t`Replace secret`}
        message={confirmMessage}
        confirmLabel={
          confirming === REMOVE ? t`Remove secret` : t`Replace secret`
        }
        cancelLabel={t`Cancel`}
        destructive={confirming === REMOVE}
        onConfirm={() =>
          void (confirming === REPLACE ? makeSecret() : removeSecret())
        }
        onCancel={() => setConfirming(undefined)}
      />
      {(make.error ?? remove.error) && (
        <p role="alert" className="text-sm text-danger-fg">
          {make.error ?? remove.error}
        </p>
      )}
    </div>
  );
}

export function ProxySignInCard({
  settings,
  calls,
  onChanged,
  joinedEvents,
}: {
  settings: ProxySignInSettings;
  calls: AdminProxySignInCalls;
  onChanged: () => void;
  joinedEvents?: string[];
}) {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [headerName, setHeaderName] = useState(settings.headerName);
  const [addresses, setAddresses] = useState(settings.addresses.join("\n"));
  const [logoutUrl, setLogoutUrl] = useState(settings.logoutUrl);
  const [siteAdmins, setSiteAdmins] = useState(settings.siteAdmins);
  const [createPeople, setCreatePeople] = useState(settings.createPeople);
  const [nameHeader, setNameHeader] = useState(settings.nameHeader);
  const [saved, setSaved] = useState(false);
  const [refused, setRefused] = useState<Record<string, string>>({});
  const mutation = useFormMutation({
    call: (key) =>
      calls.save(
        {
          enabled,
          headerName,
          addresses: addresses
            .split(/\r?\n/)
            .map((a) => a.trim())
            .filter((a) => a !== ""),
          logoutUrl,
          siteAdmins,
          createPeople,
          nameHeader,
        },
        key
      ),
    fieldNames: ["headerName", "addresses", "logoutUrl", "nameHeader"],
    explainRefusals: true,
  });
  const fields = { ...mutation.fields, ...refused };
  const unprotected =
    settings.enabled && !settings.secretSet && settings.addresses.length === 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setRefused({});
    const result = await mutation.submit();
    if (!result) return;
    if (result.ok) {
      setSaved(true);
      onChanged();
    } else if (result.kind === "refused" && REFUSED_FIELD[result.code])
      setRefused({ [REFUSED_FIELD[result.code]]: result.message });
  };

  return (
    <section
      aria-label={t`Sign-in through a proxy`}
      className="max-w-2xl space-y-4"
    >
      <h2 className="text-xl font-bold text-fg">
        <Trans>Sign-in through a proxy</Trans>
      </h2>
      <p className="text-sm text-fg-subtle">
        <Trans>
          If a sign-in proxy (oauth2-proxy, Authelia, and similar) sits in front
          of this site, people it has signed in act as the person with the email
          it sends. They pick no name.
        </Trans>
      </p>
      {unprotected && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border-2 border-danger bg-danger-tint p-3 text-sm text-danger-fg"
        >
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <Trans>
              Anyone who reaches the app without the proxy can send the header
              and become any person. Set a secret or proxy addresses, unless no
              other path to the app exists.
            </Trans>
          </span>
        </p>
      )}
      <OwnRequest settings={settings} />
      <form noValidate onSubmit={(e) => void submit(e)} className="space-y-4">
        <CheckboxField
          label={t`Sign in through a proxy`}
          name="enabled"
          checked={enabled}
          onChange={setEnabled}
        />
        <TextField
          label={t`Header with the email`}
          name="headerName"
          value={headerName}
          onChange={setHeaderName}
          error={fields.headerName}
        />
        <TextAreaField
          label={t`Proxy addresses`}
          name="addresses"
          rows={3}
          value={addresses}
          onChange={setAddresses}
          hint={t`One IP address or range (10.0.0.0/8) per line. Empty means no address check.`}
          error={fields.addresses}
        />
        <TextField
          label={t`Sign out address`}
          name="logoutUrl"
          value={logoutUrl}
          onChange={setLogoutUrl}
          hint={t`Where Sign out leads. Empty hides Sign out.`}
          error={fields.logoutUrl}
        />
        <CheckboxField
          label={t`Site admins sign in through the proxy too`}
          name="siteAdmins"
          checked={siteAdmins}
          onChange={setSiteAdmins}
          hint={t`Off: a site admin behind the proxy is a normal person and signs in with a password to administer.`}
        />
        <CheckboxField
          label={t`Create people the site does not know`}
          name="createPeople"
          checked={createPeople}
          onChange={setCreatePeople}
          hint={t`Off: a person the site does not know gets a notice and no sign-in. On: they are made at their first visit and confirm their name.`}
        />
        {createPeople && (
          <TextField
            label={t`Header with the name`}
            name="nameHeader"
            value={nameHeader}
            onChange={setNameHeader}
            hint={t`Optional, for example Remote-Name. Empty uses the part of the email before the @.`}
            error={fields.nameHeader}
          />
        )}
        {joinedEvents && (
          <p className="text-sm text-fg-muted">
            {joinedEvents.length > 0 ? (
              <Trans>
                People who sign in through the proxy join these events:{" "}
                {joinedEvents.join(", ")}. Change this in each event's settings.
              </Trans>
            ) : (
              <Trans>
                People who sign in through the proxy join no event yet. Turn
                this on in an event's settings.
              </Trans>
            )}
          </p>
        )}
        <FormErrorSummary
          fields={fields}
          error={Object.keys(refused).length > 0 ? null : shown(mutation)}
          onJump={jumpTo}
        />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={mutation.pending}>
            {mutation.pending ? t`Saving...` : t`Save proxy sign-in`}
          </Button>
          {saved && (
            <p role="status" className="text-sm text-success-fg">
              <Trans>Proxy sign-in saved.</Trans>
            </p>
          )}
        </div>
      </form>
      <SecretSection settings={settings} calls={calls} onChanged={onChanged} />
    </section>
  );
}
