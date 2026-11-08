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
