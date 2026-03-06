import { Platform } from 'react-native';
import { getSetting, setSetting } from '@/core/db/sqlite';

export type ConsentSnapshot = {
  analyticsEnabled: boolean;
  updatedAt: string | null;
};

const STORAGE_KEY = 'consent.analytics';

const defaultConsent: ConsentSnapshot = {
  analyticsEnabled: false,
  updatedAt: null,
};

function parseConsent(value: string | null): ConsentSnapshot {
  if (!value) return defaultConsent;

  try {
    const parsed = JSON.parse(value) as ConsentSnapshot;
    return {
      analyticsEnabled: Boolean(parsed.analyticsEnabled),
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return defaultConsent;
  }
}

export async function getConsent(): Promise<ConsentSnapshot> {
  if (Platform.OS === 'web') {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    return parseConsent(raw);
  }

  const stored = await getSetting(STORAGE_KEY);
  return parseConsent(stored);
}

export async function setConsent(analyticsEnabled: boolean): Promise<ConsentSnapshot> {
  const next: ConsentSnapshot = {
    analyticsEnabled,
    updatedAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(next);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, serialized);
    return next;
  }

  await setSetting(STORAGE_KEY, serialized);
  return next;
}
