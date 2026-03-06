import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { getSetting, setSetting } from '@/core/db/sqlite';

export type Entitlement = 'free' | 'pro' | 'enterprise';

const STORAGE_KEY = 'entitlement.current';

function normalizeEntitlement(value: string | null): Entitlement {
  if (value === 'pro' || value === 'enterprise') return value;
  return 'free';
}

export async function getEntitlement(): Promise<Entitlement> {
  if (Platform.OS === 'web') {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    return normalizeEntitlement(stored);
  }

  const stored = await getSetting(STORAGE_KEY);
  return normalizeEntitlement(stored);
}

export async function setEntitlement(value: Entitlement): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, value);
    return;
  }

  await setSetting(STORAGE_KEY, value);
}

export function hasPro(entitlement: Entitlement): boolean {
  return entitlement !== 'free';
}

/**
 * Hook used by UI screens to consume entitlement with optimistic updates.
 *
 * This is still a stub data source (local storage/settings table), but the
 * public API mirrors what we will need with a real IAP provider.
 */
export function useEntitlement() {
  const [entitlement, setEntitlementState] = useState<Entitlement>('free');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const current = await getEntitlement();
      setEntitlementState(current);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (next: Entitlement) => {
    await setEntitlement(next);
    setEntitlementState(next);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    entitlement,
    loading,
    hasPro: hasPro(entitlement),
    setEntitlement: update,
    reload,
  };
}
