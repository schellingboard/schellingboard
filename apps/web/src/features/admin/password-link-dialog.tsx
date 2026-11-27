import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useEffect, useRef, useState } from "react";

import type { AdminGuestCalls } from "../../commands/admin-guests";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminGuest } from "../../queries/admin-guests";
import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-danger-fg">
      {error}
    </p>
  );
}

function LinkToHandOver({ name, url }: { name: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-fg-muted">
        <Trans>
          Send this link to {name} privately. It works once, for 24 hours.
          Anyone who opens it can set {name}&apos;s password.
        </Trans>
      </p>
      <input
        readOnly
        aria-label={t`Password link for ${name}`}
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-md border border-line bg-surface-raised px-2 py-1 text-sm"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void copy()}>
          <Trans>Copy link</Trans>
        </Button>
        {copied && (
          <p role="status" className="text-sm text-fg-muted">
            <Trans>Link copied</Trans>
          </p>
        )}
      </div>
    </div>
  );
}

function useNewLink(guestId: string, calls: AdminGuestCalls) {
  const [url, setUrl] = useState<string | null>(null);
  const mutation = useFormMutation({
    call: () => calls.createPasswordLink(guestId),
    explainRefusals: true,
  });
  const make = async () => {
    const result = await mutation.submit();
    if (!result?.ok || !result.data) return;
    const query = new URLSearchParams({
      guest: guestId,
      token: result.data.token,
    });
    setUrl(`${window.location.origin}/auth/reset?${query.toString()}`);
  };
  return { url, make, pending: mutation.pending, error: mutation.error };
}

export function PasswordLinkDialog({
  guest,
  calls,
  onClose,
}: {
  guest: AdminGuest;
  calls: AdminGuestCalls;
  onClose: () => void;
}) {
  const name = guest.name;
  const link = useNewLink(guest.id, calls);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void link.make();
  });

  return (
    <Dialog open onClose={onClose} title={t`Password link for ${name}`}>
      {link.url ? (
        <LinkToHandOver name={name} url={link.url} />
      ) : (
        !link.error && (
          <p role="status" className="text-sm">
            <Trans>Loading…</Trans>
          </p>
        )
      )}
      <ErrorLine error={link.error} />
    </Dialog>
  );
}

export function MakeSiteAdminDialog({
  guest,
  calls,
  emailEnabled,
  onChanged,
  onClose,
}: {
  guest: AdminGuest;
  calls: AdminGuestCalls;
  emailEnabled: boolean | null;
  onChanged: () => void;
  onClose: () => void;
}) {
  const name = guest.name;
  // The reload after the grant must not change which question the dialog asks.
  const [hadPassword] = useState(guest.hasPassword);
  const [granted, setGranted] = useState(false);
  const [sent, setSent] = useState(false);
  const keep = useFormMutation({
    call: (key) => calls.setSiteAdmin(guest.id, true, key, false),
    explainRefusals: true,
  });
  const reset = useFormMutation({
    call: (key) => calls.setSiteAdmin(guest.id, true, key, true),
    explainRefusals: true,
  });
  const mail = useFormMutation({
    call: (key) => calls.mailPasswordLink(guest.id, key),
    explainRefusals: true,
  });
  const link = useNewLink(guest.id, calls);
  const pending = keep.pending || reset.pending || mail.pending || link.pending;
  const error = keep.error ?? reset.error ?? mail.error ?? link.error;
  const canMail = emailEnabled === true && !!guest.email;

  const grant = async (mutation: typeof keep) => {
    if (!(await mutation.submit())?.ok) return false;
    setGranted(true);
    onChanged();
    return true;
  };
  const deliver = async (how: () => Promise<void>) => {
    if (granted || (await grant(keep))) await how();
  };
  const send = async () => {
    if ((await mail.submit())?.ok) setSent(true);
  };

  const offerLink = !hadPassword || granted;

  return (
    <Dialog open onClose={onClose} title={t`Make ${name} a site admin?`}>
      <div className="flex flex-col gap-3">
        {granted && (
          <p role="status" className="text-sm text-success-fg">
            <Trans>{name} is now a site admin.</Trans>
          </p>
        )}
        {link.url ? (
          <LinkToHandOver name={name} url={link.url} />
        ) : sent ? (
          <p role="status" className="text-sm text-success-fg">
            <Trans>A password link was sent to {name}.</Trans>
          </p>
        ) : offerLink ? (
          <>
            <p className="text-sm text-fg-muted">
              <Trans>
                {name} has no password. A password link lets them set one.
              </Trans>
            </p>
            <div className="flex flex-wrap gap-2">
              {canMail && (
                <Button disabled={pending} onClick={() => void deliver(send)}>
                  <Trans>Send password link</Trans>
                </Button>
              )}
              <Button
                variant={canMail ? "quiet" : undefined}
                disabled={pending}
                onClick={() => void deliver(link.make)}
              >
                <Trans>Copy password link</Trans>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-fg-muted">
              <Trans>
                {name} already has a password. Reset it if you are not sure that{" "}
                {name} set the password themselves, for example after a
                forwarded join link. The password then stops working, their
                sessions end, and you give them a password link.
              </Trans>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={pending}
                onClick={() =>
                  void grant(keep).then((done) => done && onClose())
                }
              >
                <Trans>Make site admin</Trans>
              </Button>
              <Button
                variant="quiet"
                disabled={pending}
                onClick={() => void grant(reset)}
              >
                <Trans>Reset password</Trans>
              </Button>
            </div>
          </>
        )}
        <ErrorLine error={error} />
      </div>
    </Dialog>
  );
}
