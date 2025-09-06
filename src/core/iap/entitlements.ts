/**
 * Entitlements (subscription access levels)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Central place to represent which access tier the current user/session has.
 *  - Keep entitlement checks readable and consistent across the app.
 *
 * SCOPE (comments only, no behavior changes)
 *  - This module currently returns a hard-coded 'free' entitlement.
 *  - In the future, integrate with the in-app purchase (IAP) provider so that
 *    entitlement reflects an active subscription (e.g., RevenueCat, StoreKit 2
 *    on iOS, Google Play Billing on Android).
 *
 * DESIGN NOTES
 *  - Keep the public surface minimal: a type (Entitlement) and a couple of
 *    helpers (`getEntitlement`, `hasPro`).
 *  - Treat 'enterprise' as superset of 'pro' for gating (see `hasPro`), unless
 *    we introduce enterprise-only features later.
 *
 * PERSISTENCE & SYNC (future)
 *  - Read IAP state from the chosen provider SDK and cache to secure storage if
 *    needed. Always prefer the provider's authoritative state to avoid drift.
 *  - Handle expiration, grace periods, and billing retries according to product
 *    rules. Consider a lightweight state machine if rules grow complex.
 *
 * TESTING
 *  - Mock `getEntitlement()` in unit tests to simulate each tier.
 *  - For E2E, seed the provider with test products or use sandbox accounts.
 *
 * Last reviewed: 2025-09-03
 */

/**
 * Union of supported access tiers.
 * - 'free'       → default tier; limited features.
 * - 'pro'        → paid tier; unlocks all "pro" features.
 * - 'enterprise' → organization plans; includes all "pro" features plus extras.
 *
 * NOTE: Keep names stable; changing literals breaks persisted references.
 */
export type Entitlement = 'free' | 'pro' | 'enterprise';

// Placeholder: hoje retorna 'free'. Depois integre com RevenueCat/IAP state.
/**
 * Get the current entitlement for the active user/session.
 * CURRENT BEHAVIOR: returns 'free' (placeholder).
 * NEXT STEPS: wire this to your IAP provider (e.g., RevenueCat) and return the
 * actual entitlement derived from subscription status.
 *
 * @returns The entitlement string literal for the user ('free' | 'pro' | 'enterprise').
 */
export function getEntitlement(): Entitlement {
  return 'free';
}

/**
 * Convenience predicate for "pro-gated" features.
 * Treats both 'pro' and 'enterprise' as satisfying "pro" access, because
 * 'enterprise' is a superset of 'pro' for feature gating.
 *
 * @returns true when entitlement is not 'free'.
 */
export function hasPro(): boolean {
  return getEntitlement() !== 'free';
}
