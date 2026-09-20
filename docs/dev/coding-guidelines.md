# Coding Guidelines

## Code style

- TypeScript strict mode throughout
- Prefer server components; use server actions for mutations
- Tailwind CSS for all styling
- All UI must be mobile-responsive

## Comments

**Comment the WHY, not the WHAT.** The code already says what it does; a comment
earns its place only by adding something the reader can't get from reading it —
the constraint, the bug, the surprising interaction, the alternative that was
tried and failed.

Default to no comment. Write one when:

- a line looks wrong or arbitrary until you know the reason (a workaround, a
  browser quirk, an ordering constraint, a magic number)
- a file or exported function has a non-obvious purpose or scope
- the logic is genuinely intricate and a one-line summary saves the reader
  reconstructing it

Do not write:

- restatements of the code — `// toggle the like`, `// loop over the sessions`,
  `// set loading to true`
- doc blocks on self-explanatory functions, or `@param`/`@returns` that only
  repeat the signature. TypeScript types are the documentation
- section banners (`// ---- helpers ----`), commented-out code, or notes about
  the change being made (`// now also handles X`, `// new in v2`) — that belongs
  in the commit message
- comments that will silently go stale because they duplicate a value or
  behavior defined elsewhere

Keep them short: one or two lines is usually enough, and prefer prose over
ceremony. Longer is fine when the reason genuinely needs it (an ADR-sized
constraint, a subtle race), but that should be rare.

```ts
// Bad — says what the code says
// Get the guest and check if they are a host
const guest = await getActingGuest();
if (guest?.id === session.hostId) {

// Good — says what the code can't
// Hosts bypass the vote check: they can always edit their own session, even
// after voting closes.
```

**This guideline outranks consistency with surrounding code.** If a file is full
of noisy comments, don't match it — write the sparse version. Removing an
obsolete or redundant comment in code you're already touching is welcome; a
sweeping comment-cleanup pass across untouched files is not.

## Colours

**Never write a palette shade** (`bg-white`, `text-gray-500`, `border-gray-300`).
Name the role instead, and both themes follow for free:

| Role        | Tokens                                                                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backgrounds | `surface`, `surface-raised` (cards, menus, modals), `surface-sunken`, `surface-muted`, `surface-hover`, `surface-inverse`                                                        |
| Text        | `fg`, `fg-muted`, `fg-subtle`, `fg-faint` (decorative only), `fg-inverse`                                                                                                        |
| Borders     | `line` (controls), `line-subtle` (dividers), `line-strong`                                                                                                                       |
| Brand       | `brand` (fills), `brand-hover`, `brand-fg` (accent text), `brand-accent` (rings/borders), `brand-tint`, `brand-tint-hover`, `on-brand`                                           |
| Semantic    | `danger`, `danger-fg`, `danger-tint`, `danger-border`, `on-danger`, `warning`, `warning-fg`, `warning-tint`, `success-fg`, `link`, `link-hover`, `info`, `info-hover`, `on-info` |
| Chrome      | `bar`, `bar-fg`, `bar-fg-subtle` (admin header, toasts — dark in _both_ themes, so not `surface-inverse`), `overlay`                                                             |

Text that sits on a coloured fill uses the fill's own `on-*` token
(`bg-brand text-on-brand`), not `text-fg-inverse` — the latter flips with the
theme, while lettering on a brand button stays white in both.

Three rules that are easy to get wrong:

- **Elevation, not shadow.** A raised surface must use `bg-surface-raised`; a
  shadow alone is invisible in dark mode.
- **Never encode state in colour alone.** A selected or active state also needs
  a shape, an icon or an aria attribute — see
  [#802](https://github.com/schellingboard/schellingboard/issues/802) for what
  happens otherwise.
- **`fg-subtle` and `line` only go on the page grounds** (`surface`,
  `surface-raised`, `surface-sunken`). On a filled panel — `surface-muted` or
  `surface-hover` — they drop under the required ratio, so use `fg-muted` and
  `line-strong` there.

The location colours on the schedule are the one exception to the rule above:
they stay palette names, because a location's colour is data. Put `loc-<name>`
on the element and add the role class for what you are drawing — `loc-block`,
`loc-block-dim`, `loc-badge`, `loc-tag`, `loc-swatch`. Each mixes the hue into
the surface and foreground tokens in `app/globals.css`, so the same class works
in both themes — never write `bg-${color}-500` again.

Token values live in `app/globals.css` and are the only place a colour is
chosen. `tests/unit/theme-contrast.test.ts` asserts the WCAG ratio of every pair
in both themes, and `tests/unit/location-colors.test.ts` does the same for all
22 location hues, so changing one tells you what it broke. See
[ADR 0005](adr/0005-dark-mode.md).

## Authorization

**Every handler that modifies data must resolve the acting guest first —
before validation — and refuse to act as a protected guest without a
verified session.** This applies to REST routes, server actions, and server
components alike. Read-only surfaces are exempt.

Gating an action in the UI is never sufficient. Hiding an Edit button stops
the honest path only; the handler behind it is reachable directly. Where the
UI restricts an operation to certain guests (e.g. hosts), the handler must
enforce the same rule independently.

Helpers live in `utils/acting-guest.ts` (they hit the database, so they
can't live in `utils/auth.ts`, which must stay importable from the proxy).
`tests/integration/mutating-surface-guard.test.ts` guards the invariant by
enumerating the mutating surfaces and failing on one that doesn't resolve an
acting guest.
