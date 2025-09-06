/**
 * Animal Repository (native SQLite + web localStorage)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Provide a single persistence/access layer for `Animal` entities.
 *  - On iOS/Android, use SQLite via our `sqlite` helper; on Web, fall back to
 *    localStorage for simple offline persistence.
 *
 * SCOPE (comments only)
 *  - Implementation below is left exactly as-is; we only add documentation and
 *    context for future maintainers. No behavior or signatures were changed.
 *
 * DATA SHAPE
 *  - The `Animal` domain type is stored as-is. Any schema evolution should be
 *    handled by database migrations (native) and by transform logic (web) if
 *    the localStorage format changes.
 *
 * ID & VERSIONING
 *  - New records receive a UUID v4. The `version` field is incremented on each
 *    upsert to support optimistic concurrency and potential sync flows.
 *
 * Last reviewed: 2025-09-04
 */

// React Native platform detection to decide native (SQLite) vs. Web storage.
import { Platform } from 'react-native';
// Low-level SQLite helpers used only on native platforms.
import { getAll, run } from '@/core/db/sqlite';
// Strongly-typed domain entity persisted by this repository.
import type { Animal } from '@/domain/animal';
// Polyfills crypto.getRandomValues in RN; required by `uuid` generator.
import 'react-native-get-random-values';
// UUID v4 generator for new entities (creation path).
import { v4 as uuidv4 } from 'uuid';

// True when running on Web; toggles the persistence backend.
const isWeb = Platform.OS === 'web';
// Storage key for the Web fallback (serialized array of Animal).
const STORAGE_KEY = 'pvf.animals';

/**
 * Read the current list from localStorage (Web fallback).
 * - Returns an empty array on any parsing/IO error.
 */
function loadWeb(): Animal[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Animal[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persist the full list back to localStorage (Web fallback).
 * - Best-effort write; silently ignores quota/IO errors.
 */
function saveWeb(list: Animal[]) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * List animals in most-recently-updated order.
 * - Web: load from localStorage and sort by `updatedAt` (descending).
 * - Native: query SQLite with ORDER BY `updatedAt` DESC.
 */
export async function listAnimals(): Promise<Animal[]> {
  if (isWeb) {
    const list = loadWeb();
    return list.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }
  return getAll<Animal>('SELECT * FROM animals ORDER BY updatedAt DESC');
}

/**
 * Create or update an animal (upsert).
 *
 * @param input Partial<Animal> & { tag: string; sex: 'M' | 'F' }
 *   - `id` omitted => create with `uuidv4()`; provided => update existing.
 *   - `version` auto-increments (defaults to 0 on first write).
 *
 * @returns The persisted entity (same shape on both backends).
 */
export async function upsertAnimal(
  input: Partial<Animal> & { tag: string; sex: 'M' | 'F' }
): Promise<Animal> {
  // ISO 8601 timestamp used for ordering and potential sync/conflict logic.
  const now = new Date().toISOString();
  // Normalize the entity to a full `Animal` object before persistence.
  const entity: Animal = {
    id: input.id ?? uuidv4(),
    tag: input.tag,
    sex: input.sex,
    breed: input.breed,
    birthDate: input.birthDate,
    updatedAt: now,
    version: (input.version ?? 0) + 1,
  };

  // Web path: upsert into the in-memory list, then write back to localStorage.
  if (isWeb) {
    const list = loadWeb();
    const idx = list.findIndex((a) => a.id === entity.id);
    if (idx >= 0) list[idx] = entity; else list.unshift(entity);
    saveWeb(list);
    return entity;
  }

  // Native path: parameterized UPSERT into SQLite for correctness and caching.
  await run(
    `INSERT OR REPLACE INTO animals (id, tag, sex, breed, birthDate, updatedAt, version)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [entity.id, entity.tag, entity.sex, entity.breed ?? null, entity.birthDate ?? null, entity.updatedAt, entity.version]
  );
  return entity;
}
