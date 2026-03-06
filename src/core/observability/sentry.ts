import * as Sentry from '@sentry/react-native';

let initialized = false;

/**
 * Initializes Sentry only when DSN is available.
 *
 * This keeps local/dev environments noise-free and allows production builds to
 * enable crash reporting by setting EXPO_PUBLIC_SENTRY_DSN.
 */
export function initSentry() {
  if (initialized) return;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    enableNativeFramesTracking: true,
    tracesSampleRate: 0.1,
  });

  initialized = true;
}

export function captureError(error: unknown, context?: Record<string, string | number | boolean>) {
  const normalized = error instanceof Error ? error : new Error(String(error));
  Sentry.captureException(normalized, {
    extra: context,
  });
}
