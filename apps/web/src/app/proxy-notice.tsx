import { Trans } from "@lingui/react/macro";

export function ProxyNotice({ unknownEmail }: { unknownEmail: boolean }) {
  if (!unknownEmail) return null;
  return (
    <p
      role="status"
      className="mb-4 rounded-md border border-line bg-surface-muted p-3 text-sm text-fg"
    >
      <Trans>
        This site has no person with the email your sign-in sent. Ask an
        organizer to add you.
      </Trans>
    </p>
  );
}
