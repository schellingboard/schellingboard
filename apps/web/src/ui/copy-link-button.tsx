import { useState } from "react";
import { Button } from "./button";

/** Copies the address of the open panel, for an app that has no address bar. */
export function CopyLinkButton() {
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
    <div className="flex items-center gap-3">
      <Button
        variant="quiet"
        className="border border-line"
        onClick={() => void copy()}
      >
        Copy link
      </Button>
      <span role="status" className="text-sm text-fg-muted">
        {state === "copied" && "Link copied"}
        {state === "failed" && "Could not copy the link"}
      </span>
    </div>
  );
}
