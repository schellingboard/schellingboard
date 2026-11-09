// A second navigation aborts the first one mid-flight: logging out reloads,
// while the sign-out's refetch, now refused, sends the page to /login too.
let leaving = false;

function leave(go: () => void) {
  if (leaving) return;
  leaving = true;
  go();
}

export const hardNavigate = (href: string) =>
  leave(() => location.replace(href));

export const hardReload = () => leave(() => location.reload());
