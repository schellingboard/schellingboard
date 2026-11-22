import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

import { cx } from "../../ui/cx";
import {
  CalendarDaysIcon,
  InformationCircleIcon,
  ProposalsIcon,
} from "../../ui/icons";

export const PROPOSALS_PAGE = "proposals";
export const SCHEDULE_PAGE = "schedule";

export const EVENT_TOOL_CLASS =
  "flex items-center gap-1 rounded-md px-1 py-1.5 text-xs text-fg-subtle hover:text-brand-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent sm:text-sm";

const TAB_CLASS =
  "flex items-center gap-1.5 border-b-2 px-2 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent";

/**
 * The same switch between an event's proposals and its schedule on both pages,
 * followed by its details. Without proposals there is nothing to switch to.
 */
export function EventPagesNav({
  current,
  proposalsHref,
  scheduleHref,
  showProposals,
  onOpenDetails,
}: {
  current: typeof PROPOSALS_PAGE | typeof SCHEDULE_PAGE;
  proposalsHref: string;
  scheduleHref: string;
  showProposals: boolean;
  onOpenDetails: () => void;
}) {
  const pages = [
    {
      name: PROPOSALS_PAGE,
      href: proposalsHref,
      label: t`Proposals`,
      icon: ProposalsIcon,
    },
    {
      name: SCHEDULE_PAGE,
      href: scheduleHref,
      label: t({ message: "Schedule", context: "noun" }),
      icon: CalendarDaysIcon,
    },
  ] as const;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {showProposals && (
        <nav aria-label={t`Event pages`} className="flex">
          {pages.map((page) => (
            <a
              key={page.name}
              href={page.href}
              aria-current={current === page.name ? "page" : undefined}
              className={cx(
                TAB_CLASS,
                current === page.name
                  ? "border-brand-accent text-brand-fg"
                  : "border-transparent text-fg-subtle hover:border-line hover:text-fg"
              )}
            >
              <page.icon className="h-4 w-4 stroke-2" />
              {page.label}
            </a>
          ))}
        </nav>
      )}
      <button
        type="button"
        onClick={onOpenDetails}
        className={EVENT_TOOL_CLASS}
      >
        <InformationCircleIcon className="h-4 w-4 stroke-2" />
        <Trans>Event details</Trans>
      </button>
    </div>
  );
}
