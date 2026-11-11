import { useState } from "react";

import { Button } from "./button";
import { Square2StackIcon } from "./icons";
import { Tooltip } from "./tooltip";

/** Copies the address of the open panel, for an app that has no address bar. */
export function CopyLinkButton({ className = "" }: { className?: string }) {
  const [state, setState] = useState<"copied" | "failed">();
  const copy = async () => {
    setState(undefined);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      setState("failed");
    }
  };
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Tooltip content="Copy the address of this page, to share it or open it again later">
        <Button
          variant="quiet"
          className="inline-flex items-center gap-1.5 border border-line"
          onClick={() => void copy()}
        >
          <Square2StackIcon className="h-4 w-4" />
          Copy link
        </Button>
      </Tooltip>
      <span role="status" className="text-sm text-fg-muted">
        {state === "copied" && "Link copied"}
        {state === "failed" && "Could not copy the link"}
      </span>
    </div>
  );
}
