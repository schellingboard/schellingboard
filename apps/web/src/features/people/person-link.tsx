import { profileExcerpt } from "@schellingboard/domain/attendee-profile";
import type { DirectoryEntry } from "../../queries/directory";
import { Avatar } from "../../ui/avatar";
import { plainText } from "../../ui/plain-text";
import { Tooltip } from "../../ui/tooltip";
import { usePersonEntry } from "./person-cards";

function canHover(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover)").matches
  );
}

function PersonCard({ entry }: { entry: DirectoryEntry }) {
  const where = [entry.pronouns, entry.basedIn].filter(Boolean).join(" · ");
  const excerpt = profileExcerpt(entry, (md) => plainText(md ?? ""));
  return (
    <div className="flex w-64 items-start gap-3 p-3">
      <Avatar name={entry.name} size="md" image={entry.avatarUrl} />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">{entry.name}</span>
        {entry.isHost && (
          <span className="w-fit rounded-full bg-brand-tint-hover px-2 py-0.5 text-xs font-semibold text-brand-fg">
            Session host
          </span>
        )}
        {where && <span className="text-sm text-fg-subtle">{where}</span>}
        {excerpt && (
          <span className="line-clamp-2 text-sm text-fg-muted">{excerpt}</span>
        )}
      </div>
    </div>
  );
}

/**
 * A link to someone's profile that, where there is a mouse, shows a short card
 * on hover or keyboard focus. A touch screen just follows the link.
 */
export function PersonLink({
  guestId,
  href,
  name,
  className,
  newTab,
}: {
  guestId: string;
  href: string;
  name: string;
  className?: string;
  newTab?: boolean;
}) {
  const { entry, load } = usePersonEntry(guestId);
  const hover = canHover();
  const start = hover && load ? load : undefined;
  return (
    <span onMouseEnter={start} onFocus={start}>
      <Tooltip
        as="span"
        interactive
        content={hover && entry ? <PersonCard entry={entry} /> : undefined}
      >
        {(describedBy) => (
          <a
            href={href}
            className={className}
            {...(newTab && { target: "_blank", rel: "noopener" })}
            {...describedBy}
          >
            {name}
          </a>
        )}
      </Tooltip>
    </span>
  );
}
