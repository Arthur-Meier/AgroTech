# AgroTec MVP QA Checklist (PVF-21)

## Scope
- Animal list
- Animal create/edit form
- Local persistence (SQLite/web local storage fallback)
- Theme adaptation (light/dark)
- Entitlement gating and paywall stub
- Consent and privacy links
- CSV export behavior

## Functional checks
- [ ] Open app and verify `Animals` screen loads without crash.
- [ ] Create animal with required fields and save success alert.
- [ ] Edit existing animal and verify changes appear in list.
- [ ] Validate required field errors (tag, date format, numeric weight).
- [ ] Verify list ordering by most recent update.
- [ ] Verify empty state when no animal exists.
- [ ] Verify error state and retry action when repository throws.
- [ ] Verify free-plan limit blocks create and opens paywall.
- [ ] Verify CSV export is blocked in free and allowed in pro (stub).
- [ ] Verify switching to pro in paywall returns and unlocks gates.
- [ ] Verify consent screen toggles analytics flag and persists.

## UX and accessibility checks
- [ ] Layout remains usable at 320px width.
- [ ] Buttons have minimum touch area and visible pressed state.
- [ ] Text remains readable in dark mode and light mode.
- [ ] Form keeps action reachable with keyboard open.
- [ ] Navigation between tabs/screens is predictable.

## Regression checks
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Unit tests pass with coverage generated.
- [ ] CI workflow runs successfully in pull requests.
