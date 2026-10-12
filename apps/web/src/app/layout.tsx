import type { ReactNode } from "react";

export function Layout({
  nav,
  footer,
  children,
}: {
  nav: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface-raised focus:p-2"
      >
        Skip to content
      </a>
      {nav}
      <main id="main" className="flex-1 pt-20 sm:p-3 sm:pt-24 lg:px-24">
        {children}
      </main>
      {footer}
    </div>
  );
}
