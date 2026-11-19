import { isEventIconName } from "@schellingboard/domain/event-icons";

import { EVENT_ICONS } from "./event-icons";

export function EventIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className: string;
}) {
  if (!name || !isEventIconName(name)) return null;
  const Icon = EVENT_ICONS[name];
  return <Icon aria-hidden className={className} />;
}
