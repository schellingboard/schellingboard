import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { landOnPanel, type PanelItem } from "./panel-history";

/** A panel item's own address opened directly: `background` is the page behind its panel. */
export function PanelLanding({
  item,
  background,
}: {
  item: PanelItem;
  background: string;
}) {
  const { history } = useRouter();
  const landed = useRef(false);
  useEffect(() => {
    if (landed.current) return;
    landed.current = true;
    landOnPanel(history, item, background, history.location.hash);
  }, [history, item, background]);
  return null;
}
