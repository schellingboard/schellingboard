import { type ReactNode, useState } from "react";

import { EventIcon } from "../ui/event-icon";

export type NavItem = { name: string; href: string; icon?: string | null };

function ItemLabel({ item }: { item: NavItem }) {
  return (
    <span className="flex items-center gap-1.5">
      <EventIcon name={item.icon} className="h-4 w-4 shrink-0" />
      {item.name}
    </span>
  );
}

const linkClass = (current: boolean) =>
  `rounded-md px-3 py-2 text-sm font-medium ${current ? "bg-brand-tint text-brand-fg" : "text-fg-subtle hover:bg-surface-muted"}`;

export function NavBar({
  items,
  currentPath,
  children,
}: {
  items: NavItem[];
  currentPath: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isCurrent = (item: NavItem) =>
    items.length > 1 && currentPath.startsWith(item.href);

  return (
    <header className="fixed z-30 w-full border-b border-line bg-surface-raised">
      <div className="flex h-16 items-center justify-between gap-2 px-2 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-brand-fg hover:bg-brand-tint focus:outline-none focus:ring-2 focus:ring-brand-accent sm:hidden"
        >
          <span aria-hidden className="text-xl leading-none">
            {open ? "✕" : "☰"}
          </span>
        </button>
        <nav className="hidden min-w-0 flex-1 gap-4 overflow-x-auto sm:flex">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item) ? "page" : undefined}
              className={linkClass(isCurrent(item))}
            >
              <ItemLabel item={item} />
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">{children}</div>
      </div>
      {open && (
        <nav aria-label="Menu" className="space-y-1 px-2 pb-3 pt-2 sm:hidden">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item) ? "page" : undefined}
              className={`block ${linkClass(isCurrent(item))}`}
            >
              <ItemLabel item={item} />
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
