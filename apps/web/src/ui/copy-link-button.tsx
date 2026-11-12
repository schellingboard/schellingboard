import { useState } from "react";
import { Button } from "./button";
import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

/** Copies the address of the open panel, for an app that has no address bar. */
export function CopyLinkButton() {
  const [message, setMessage] = useState<MessageDescriptor>();
  const copy = async () => {
    setMessage(undefined);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage(msg`Link copied`);
    } catch {
      setMessage(msg`Could not copy the link`);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="quiet"
        className="border border-line"
        onClick={() => void copy()}
      >
        <Trans>Copy link</Trans>
      </Button>
      <span role="status" className="text-sm text-fg-muted">
        {message && i18n._(message)}
      </span>
    </div>
  );
}
