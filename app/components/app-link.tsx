import type { ComponentProps } from "react";
import Link from "next/link";

/**
 * Whether Next can navigate to `href` itself. A root path outside `/legacy` is
 * a page of the single-page app, which Next's client navigation has nothing to
 * fetch for, so it needs a plain link.
 */
export function staysInNext(href: string): boolean {
  return !href.startsWith("/") || /^\/(legacy|api)(\/|\?|#|$)/.test(href);
}

/** A `Link` that turns into a plain anchor where the target is the SPA's. */
export function AppLink(props: ComponentProps<typeof Link>) {
  const { href, prefetch, replace, scroll, ...anchor } = props;
  void prefetch;
  void replace;
  void scroll;
  if (typeof href === "string" && !staysInNext(href))
    return <a href={href} {...anchor} />;
  return <Link {...props} />;
}
