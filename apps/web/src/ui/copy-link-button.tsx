import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";

import { Button } from "./button";
import { Square2StackIcon } from "./icons";
import { Tooltip } from "./tooltip";

/** Copies the address of the open panel, for an app that has no address bar. */
export function CopyLinkButton({ className = "" }: { className?: string }) {
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
    <div className={`flex items-center gap-3 ${className}`}>
      <Tooltip
        content={t`Copy the address of this page, to share it or open it again later`}
      >
        <Button
          variant="quiet"
          className="inline-flex items-center gap-1.5 border border-line"
          onClick={() => void copy()}
        >
          <Square2StackIcon className="h-4 w-4" />
          <Trans>Copy link</Trans>
        </Button>
      </Tooltip>
      <span role="status" className="text-sm text-fg-muted">
        {message && i18n._(message)}
      </span>
    </div>
  );
}
