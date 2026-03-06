import type { Entitlement } from '@/core/iap/entitlements';

/**
 * Product limits are centralized to keep gating behavior consistent in every
 * screen. This also serves as the source for pricing/plan docs.
 */
export const FREE_PLAN_LIMITS = {
  maxAnimals: 50,
  csvExport: false,
} as const;

export function canCreateAnimal(entitlement: Entitlement, currentAnimals: number): boolean {
  if (entitlement !== 'free') return true;
  return currentAnimals < FREE_PLAN_LIMITS.maxAnimals;
}

export function canExportCsv(entitlement: Entitlement): boolean {
  if (entitlement !== 'free') return true;
  return FREE_PLAN_LIMITS.csvExport;
}
