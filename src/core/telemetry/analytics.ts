import { getConsent } from '@/core/compliance/consent';

export type AnalyticsEventName =
  | 'paywall_view'
  | 'paywall_cta_tap'
  | 'animals_export_csv'
  | 'animals_export_blocked'
  | 'animals_create_blocked';

export type AnalyticsPayload = Record<string, string | number | boolean>;

/**
 * Minimal analytics abstraction.
 * We currently log to console when consent is enabled, but all call sites use
 * this function so replacing with Amplitude/Sentry breadcrumbs later is trivial.
 */
export async function trackEvent(name: AnalyticsEventName, payload?: AnalyticsPayload) {
  const consent = await getConsent();
  if (!consent.analyticsEnabled) return;

  console.log('[analytics]', name, payload ?? {});
}
