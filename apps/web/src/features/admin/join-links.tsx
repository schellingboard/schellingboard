import { plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";

import type { AdminEventCalls } from "../../commands/admin-events";
import { useFormMutation } from "../../commands/use-form-mutation";
import { useEmailEnabled } from "../../queries/email-enabled";
import { Button } from "../../ui/button";

export function NewLink({
  eventId,
  guest,
  calls,
}: {
  eventId: string;
  guest: { id: string; name: string };
  calls: AdminEventCalls;
}) {
  const guestName = guest.name;
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const mutation = useFormMutation({
    call: () => calls.createJoinLink(eventId, guest.id),
    explainRefusals: true,
  });
  const make = async () => {
    const result = await mutation.submit();
    if (result?.ok && result.data)
      setUrl(`${window.location.origin}/join/${result.data.token}`);
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col gap-1">
      {copied && (
        <p role="status" className="text-sm text-fg-muted">
          <Trans>Link copied</Trans>
        </p>
      )}
      {url ? (
        <div className="flex gap-1">
          <input
            readOnly
            aria-label={t`Join link for ${guestName}`}
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 rounded-md border border-line bg-surface-raised px-2 py-1 text-sm"
          />
          <Button
            variant="quiet"
            aria-label={t`Copy link for ${guestName}`}
            onClick={() => void copy(url)}
          >
            <Trans>Copy</Trans>
          </Button>
        </div>
      ) : (
        <Button
          variant="quiet"
          aria-label={t`New link for ${guestName}`}
          disabled={mutation.pending}
          onClick={() => void make()}
        >
          <Trans>New link</Trans>
        </Button>
      )}
      {mutation.error && (
        <p role="alert" className="text-sm text-danger-fg">
          {mutation.error}
        </p>
      )}
    </div>
  );
}

export function MailLinks({
  eventId,
  selectedIds,
  calls,
}: {
  eventId: string;
  selectedIds: string[];
  calls: AdminEventCalls;
}) {
  const emailEnabled = useEmailEnabled(calls.emailEnabled);
  const [summary, setSummary] = useState<{
    sent: number;
    withoutEmail: number;
    failed: number;
  } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const mutation = useFormMutation({
    call: (key) =>
      calls.mailJoinLinks(
        eventId,
        selectedIds.length ? selectedIds : undefined,
        key
      ),
    explainRefusals: true,
  });
  const mail = async () => {
    setSummary(null);
    setConfirming(false);
    const result = await mutation.submit();
    if (result?.ok && result.data) {
      setSummary(result.data);
    }
  };
  const selectedCount = selectedIds.length;
  const { sent, withoutEmail, failed } = summary ?? {
    sent: 0,
    withoutEmail: 0,
    failed: 0,
  };
  if (emailEnabled === null) return null;
  if (!emailEnabled)
    return (
      <p className="text-sm text-fg-muted">
        <Trans>
          This server cannot send email. Copy a personal link for each guest and
          share it yourself.
        </Trans>
      </p>
    );
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {confirming ? (
          <>
            <Button disabled={mutation.pending} onClick={() => void mail()}>
              {selectedIds.length
                ? plural(selectedCount, {
                    one: "Yes, mail # selected guest",
                    other: "Yes, mail # selected guests",
                  })
                : t`Yes, mail all guests`}
            </Button>
            <Button variant="quiet" onClick={() => setConfirming(false)}>
              <Trans>Cancel</Trans>
            </Button>
          </>
        ) : (
          <Button
            disabled={mutation.pending}
            onClick={() => setConfirming(true)}
          >
            {selectedIds.length
              ? plural(selectedCount, {
                  one: "Mail new links to # selected",
                  other: "Mail new links to # selected",
                })
              : t`Mail new links to all guests`}
          </Button>
        )}
        <p className="text-sm text-fg-muted">
          <Trans>
            Each guest gets a personal link by email. It replaces the link they
            had before.
          </Trans>
        </p>
      </div>
      {summary && (
        <p role="status">
          {plural(sent, {
            one: "Mailed # guest.",
            other: "Mailed # guests.",
          })}{" "}
          {plural(withoutEmail, {
            one: "# has no email.",
            other: "# have no email.",
          })}{" "}
          {plural(failed, { one: "# failed.", other: "# failed." })}
        </p>
      )}
      {mutation.error && (
        <p role="alert" className="text-danger-fg">
          {mutation.error}
        </p>
      )}
    </div>
  );
}
