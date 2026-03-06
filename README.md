# AgroTec Mobile MVP (Expo + React Native)

Offline-first mobile app for animal registration and field operations.
This repository is aligned with AgroTec Notion scope (PVF sprint items).

## Tech stack
- Expo SDK 53 + React Native 0.79
- TypeScript (strict)
- React Navigation (native stack)
- SQLite (`expo-sqlite`) for local persistence
- FlashList for mobile list performance

## Project architecture
- `src/app`: app bootstrap and navigation
- `src/core`: cross-cutting concerns (db, theme, i18n, compliance, analytics, export)
- `src/domain`: domain types
- `src/data`: repositories and persistence mapping
- `src/features`: feature screens (animals, paywall, settings, compliance)
- `src/ui`: reusable UI components
- `docs`: product/compliance/process artifacts

## Implemented scope highlights
- Animals list + create/edit form (offline)
- SQLite schema + additive migration strategy
- Mobile-first list/form states (loading, empty, error)
- Theme tokens with system light/dark support
- i18n dictionary baseline (`pt-BR` with fallback)
- Entitlement model + feature gating (free/pro stub)
- Paywall stub with analytics events
- Consent flow (LGPD) and privacy policy linkage
- CSV export flow (share/download)
- Sentry-ready crash capture (enabled with `EXPO_PUBLIC_SENTRY_DSN`)
- Engineering quality baseline (lint, tests, CI, Husky)

## Scripts
```bash
npm run start
npm run typecheck
npm run lint
npm run test
npm run test:coverage
npm run format
```

## Quality and CI
- ESLint + Prettier
- Jest test suite for repository behavior
- GitHub Actions workflow: typecheck + lint + coverage
- Husky pre-commit hook: lint + tests

## iOS distribution (EAS)
- Config file: `eas.json`
- Runbook: `docs/ios-distribution.md`

## Compliance artifacts
- Privacy policy draft: `docs/privacy-policy.md`
- QA checklist: `docs/qa-checklist.md`

## Notes before production
- Replace placeholder privacy URL in `app.json`.
- Replace `ascAppId` in `eas.json`.
- Wire real billing provider and set `EXPO_PUBLIC_SENTRY_DSN`.
