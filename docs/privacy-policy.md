# AgroTec Privacy Policy Draft

Last update: 2026-03-06
Version: 1.0.0-draft

## 1. Data we collect
- Animal registration data entered by the user (tag, type, sex, origin, dates, notes).
- Usage analytics events only when explicit consent is enabled.
- Technical crash data (planned Sentry integration).

## 2. Why we collect data
- Keep offline records available to the producer.
- Improve product quality and UX with aggregated usage signals.
- Investigate crashes and regressions.

## 3. Data storage and retention
- Data is stored locally on the user device (SQLite/local storage).
- No cloud sync is enabled in this MVP.
- User can delete app data by uninstalling the app or clearing local storage.

## 4. Consent and legal basis (LGPD)
- Analytics collection is opt-in and controlled in the Consent screen.
- Consent can be revoked at any time in the app settings.

## 5. Third-party services
- Planned: Sentry for crash monitoring.
- Planned: App Store / Google Play infrastructure for billing.

## 6. User rights
- Access: user can view registered data in app screens.
- Rectification: user can edit records in app form.
- Deletion: user can remove app data from the device.
- Revocation: user can disable analytics consent.

## 7. Contact
- Product owner contact: replace with official support email before production.

## 8. Hosting and publication
This file is the legal draft source. Before App Store submission, publish it on a
public URL and update:
- `app.json` -> `expo.extra.privacyPolicyUrl`
- App Store Connect privacy policy field
