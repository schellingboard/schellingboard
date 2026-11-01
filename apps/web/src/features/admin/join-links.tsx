import { useState } from "react";
import type { AdminEventCalls } from "../../commands/admin-events";
import { useFormMutation } from "../../commands/use-form-mutation";
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
          Link copied
        </p>
      )}
      {url ? (
        <div className="flex gap-1">
          <input
            readOnly
            aria-label={`Join link for ${guest.name}`}
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 rounded-md border border-line bg-surface-raised px-2 py-1 text-sm"
          />
          <Button
            variant="quiet"
            aria-label={`Copy link for ${guest.name}`}
            onClick={() => void copy(url)}
          >
            Copy
          </Button>
        </div>
      ) : (
        <Button
          variant="quiet"
          aria-label={`New link for ${guest.name}`}
          disabled={mutation.pending}
          onClick={() => void make()}
        >
          New link
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
  const [summary, setSummary] = useState<string | null>(null);
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
      const { sent, withoutEmail, failed } = result.data;
      setSummary(
        `Mailed ${sent} ${sent === 1 ? "guest" : "guests"}. ${withoutEmail} ${withoutEmail === 1 ? "has" : "have"} no email. ${failed} failed.`
      );
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {confirming ? (
          <>
            <Button disabled={mutation.pending} onClick={() => void mail()}>
              {selectedIds.length
                ? `Yes, mail ${selectedIds.length} selected ${selectedIds.length === 1 ? "guest" : "guests"}`
                : "Yes, mail all guests"}
            </Button>
            <Button variant="quiet" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            disabled={mutation.pending}
            onClick={() => setConfirming(true)}
          >
            {selectedIds.length
              ? `Mail new links to ${selectedIds.length} selected`
              : "Mail new links to all guests"}
          </Button>
        )}
        <p className="text-sm text-fg-muted">
          Each guest gets a personal link by email. It replaces the link they
          had before.
        </p>
      </div>
      {summary && <p role="status">{summary}</p>}
      {mutation.error && (
        <p role="alert" className="text-danger-fg">
          {mutation.error}
        </p>
      )}
    </div>
  );
}
