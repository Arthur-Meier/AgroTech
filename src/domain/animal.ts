/**
 * Animal domain model types (TypeScript)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Define the canonical shape for cattle/animal records used across the app.
 *  - Keep ID and serialization rules explicit to avoid drift between layers.
 *
 * SERIALIZATION & DATES
 *  - All dates/times are strings to keep the model JSON-friendly.
 *  - Use ISO 8601:
 *      • `birthDate`: prefer date-only (YYYY-MM-DD) if no time-of-day matters.
 *      • `updatedAt`: full timestamp (e.g., 2025-09-04T12:34:56.789Z).
 *  - Avoid timezone ambiguities: normalize to UTC when storing timestamps.
 *
 * VERSIONING
 *  - `version` is a monotonic integer used for optimistic concurrency and
 *    potential sync/merge logic. Increment on each successful write.
 *
 * Last reviewed: 2025-09-04
 */

/**
 * Stable identifier for an animal.
 * - String alias helps readability without changing runtime cost.
 * - Typically a UUID v4, but any unique, immutable string is acceptable.
 */
export type AnimalId = string;

/**
 * Biological sex enumeration.
 * - 'M' for male, 'F' for female.
 * - If the domain later requires unknown/undetermined, extend this union.
 */
export type Sex = 'M' | 'F';

/**
 * Canonical animal record persisted locally (and potentially synced later).
 * Keep this interface small and portable — it should serialize cleanly to JSON.
 */
export interface Animal {
  /** Unique, immutable identifier for this animal (see `AnimalId`). */
  id: AnimalId;
  /** Management or ear tag used for human identification in the field. */
  tag: string;
  /** Biological sex (see `Sex`). */
  sex: Sex;
  /** Optional breed descriptor (free text or a future enum/code). */
  breed?: string;
  /** Date of birth in ISO format. Prefer YYYY-MM-DD when time is not relevant. */
  birthDate?: string; // ISO
  /** Last modification timestamp in ISO 8601 (UTC recommended). */
  updatedAt: string;  // ISO
  /** Monotonic version for optimistic concurrency / conflict resolution. */
  version: number;
}
