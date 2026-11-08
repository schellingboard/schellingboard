# Progress

## Facts for this run

- No pushes, no PRs. Commits stay local.
- E2E: only the specs a step touches. The user runs the full suite at the end.
- Toast infrastructure exists: `useNotify()` in `apps/web/src/ui/notices.tsx` with `autoDismissMs`.
- Keyboard combobox pattern to copy: `apps/web/src/ui/people-picker.tsx`.

## Questions

(none)

## Follow-ups

- `features/people/profile-photo.tsx` (the large profile photo) has the same
  alt-text-on-broken-image problem `ui/avatar.tsx` had; E2E rely on its alt text. Not done in
  step 4.

- Step 8: elastic overscroll (macOS) not checked; headless Firefox on Linux only. The fix is a fixed
  root gradient (bar colour top half, footer colour bottom half) while `[data-admin-frame]` is
  mounted.
- Safari/iOS (ignores `fixed`) and classic-scrollbar gutters also unverified; stops use rem for
  header/footer heights.
