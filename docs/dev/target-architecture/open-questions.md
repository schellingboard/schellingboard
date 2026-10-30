# Open questions

Open from the SPA migration ([ADR 0015](../adr/0015-spa-alongside-next.md)), below. D1–D11 and the
product questions raised during review are recorded in [08-decisions.md](08-decisions.md), with the
settled answers folded into the chapters they affect.

1. **Rate limit keying.** Open-name guests share one API bucket per address (burst 1000); at a venue
   behind one Wi-Fi address, or with `SB_TRUSTED_PROXIES` unset, all attendees share it.
   Recommendation: key by address plus guest cookie with a cap per address (the cookie is unsigned,
   so any id buys a fresh bucket).
2. **Comment likes.** The SPA has neither the "Liked by" hover preview nor the avatars the legacy
   comments show. Recommendation: add both when comments are next touched; the data is in the
   snapshot already.
3. **A toast in the SPA.** Answered: the `NoticeProvider` sits above the router, so a session form's
   confirmation (`autoDismissMs`) survives the navigation back to the schedule.
4. **`server/` reaching `app/`.** Answered: `newEmptySession` and `sessionsOverlap` live in
   `packages/domain`, and `utils/guest-clashes.ts` imports them from there.
5. **A session that loses its only room** reads `moved to No location (was Room A)` in notices.
   Recommendation: reword to "no longer has a location (was Room A)".
6. **User menu** roles copy the legacy markup without arrow-key support. Recommendation: use the
   ARIA menu pattern with arrow keys when the menu is next changed.
7. **Flaky E2E.** `settings.spec:67` can abort its first `goto`; under full-suite load
   `user-auth.spec:392`, `rsvp.spec:111` and `admin.spec:442` have each failed once and passed
   alone. The `scheduling.spec` flakes did not recur once the forms moved into the SPA.
   Recommendation: keep each attempt's trace (`--trace=retain-on-failure`) to find the rest.
8. **Picking a name without being a member.** The SPA picker offers only the snapshot's guests
   (members and hosts), because `GET /guests` is closed to anonymous visitors, so a non-member
   cannot pick their name. Recommendation: a public guest-name list for the picker that exposes
   names only.
9. **"Show map" in the SPA shell.** The uploaded site map has a footer button on the legacy pages
   only; the schedule and proposals lost it when they moved. Recommendation: a shell item, with the
   map URL in `/me` or the snapshot.
10. **An admin session that expires mid-edit.** Only the `AdminFrame` gate read sends the browser to
    the admin login; a mutation refused with 401 or 403 later shows the refusal in place.
    Recommendation: treat it as the gate does.

Add new questions here as numbered items with a recommendation; when one is decided, move the
outcome into the relevant chapter and, if it is a design decision rather than a product detail, into
`08-decisions.md`.
