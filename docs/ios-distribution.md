# iOS Distribution Runbook (PVF-14, PVF-15, PVF-22)

## EAS configuration
- File: `eas.json`
- Profiles:
  - `preview`: internal distribution for quick validation
  - `production`: auto-increment build number for release artifacts

## Build command
```bash
npx eas build -p ios --profile preview
```

## Submit command
```bash
npx eas submit -p ios --profile production
```

## Required manual setup
1. Replace `ascAppId` in `eas.json` with your App Store Connect app id.
2. Configure Apple credentials in EAS.
3. Add internal testers in App Store Connect -> TestFlight.
4. Confirm privacy policy public URL is available.
5. Upload first build and assign tester group.

## TestFlight acceptance criteria
- Build appears in TestFlight internal testing.
- At least two internal testers can install.
- Smoke tests (create/edit/list/export/consent) pass.
