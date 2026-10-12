type Where = { pathname: string; search: string; hash: string };

export const isLegacyPath = (pathname: string) =>
  pathname === "/legacy" || pathname.startsWith("/legacy/");

export function legacyHref({ pathname, search, hash }: Where): string {
  return `/legacy${pathname === "/" ? "" : pathname}${search}${hash}`;
}
