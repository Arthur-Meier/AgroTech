/**
 * SQLite Access Layer — React Native (Expo)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Provide a tiny, typed wrapper around `expo-sqlite` for native platforms.
 *  - Hide dynamic import details and expose simple helpers: `initDb`, `run`, `getAll`.
 *
 * DESIGN PRINCIPLES
 *  - **Web is not supported** by `expo-sqlite` without WASM; we consciously no-op or throw
 *    on web to avoid bundling/initializing the WASM path. Use a separate web storage layer
 *    (e.g., localStorage/IndexedDB) if needed.
 *  - Keep this module side‑effect free (it does not open the DB until first call).
 *  - Keep all comments in English for long‑term maintainability.
 *
 * SCHEMA & MIGRATIONS (FUTURE)
 *  - Currently, we create a single `animals` table on first run using `initDb()`.
 *  - For future schema changes, consider one of these strategies:
 *      • PRAGMA `user_version` and stepwise `ALTER TABLE` per version;
 *      • A dedicated `migrations` table to record applied change IDs;
 *      • Ship SQL files and replay only unapplied ones.
 *  - Keep DDL outside code if possible, but we leave it inline here for simplicity.
 *
 * CONCURRENCY & PERFORMANCE
 *  - Calls are serialized by awaiting the same `dbPromise`. Reuse a single DB handle.
 *  - WAL (Write‑Ahead Logging) is enabled for better concurrent read performance.
 *  - Prefer parameterized statements to avoid SQL injection and to let SQLite cache plans.
 *
 * TESTABILITY
 *  - `getDb()` is internal; tests can mock `run`/`getAll` or swap this module with a fake.
 *
 * Last reviewed: 2025-09-03
 */
// src/core/db/sqlite.ts
import { Platform } from 'react-native';
// React Native platform detection is used to disable SQLite on web builds.

const isWeb = Platform.OS === 'web';
// Runtime flag to branch logic for web vs native (iOS/Android).

// Dinamicamente no nativo para não acionar o WASM no Web
// Type aliases so the dynamic import of `expo-sqlite` remains type-safe.
type SQLiteModule = typeof import('expo-sqlite');
type SQLiteDatabase = import('expo-sqlite').SQLiteDatabase;

/**
 * Module‑level singletons
 * - `sqliteMod`: caches the imported `expo-sqlite` module once on native.
 * - `dbPromise`: lazy, shared promise resolving to an opened database handle.
 */
let sqliteMod: SQLiteModule | null = null;
let dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Lazily import `expo-sqlite` on native platforms.
 * - Throws on web to ensure we don't accidentally pull WASM into the bundle.
 * - Returns the cached module after the first import.
 */
async function getSQLite(): Promise<SQLiteModule> {
  if (isWeb) throw new Error('SQLite indisponível no Web (fallback em localStorage)');
  if (!sqliteMod) {
    sqliteMod = await import('expo-sqlite'); // <- não roda no Web
  }
  return sqliteMod;
}

/**
 * Open (or reuse) the app database.
 * - Database filename: `pvf.db` (sandboxed per app on iOS/Android).
 * - Uses a shared promise so multiple callers don't race to open a second handle.
 * - Throws on web (no SQLite).
 */
async function getDb(): Promise<SQLiteDatabase> {
  if (isWeb) throw new Error('SQLite indisponível no Web');
  if (!dbPromise) {
    const { openDatabaseAsync } = await getSQLite();
    dbPromise = openDatabaseAsync('pvf.db');
  }
  return dbPromise;
}

/**
 * Initialize database schema (idempotent).
 * - No-ops on web to keep web bundles lighter and avoid WASM.
 * - Enables WAL for better read concurrency.
 * - Creates `animals` table if it does not exist.
 *
 * TABLE: animals
 *  - id (TEXT, PK): Stable unique id (e.g., UUID v4).
 *  - tag (TEXT): Visual/ear tag or management identifier (required).
 *  - sex (TEXT): Animal sex enumeration (e.g., 'male'|'female').
 *  - breed (TEXT, nullable): Optional breed descriptor.
 *  - birthDate (TEXT, nullable): ISO 8601 date string; prefer UTC and yyyy-mm-dd.
 *  - updatedAt (TEXT): ISO 8601 timestamp to drive sync/conflict resolution.
 *  - version (INTEGER): Monotonic version for optimistic concurrency control.
 */
export async function initDb(): Promise<void> {
  if (isWeb) return;
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS animals (
      id TEXT PRIMARY KEY NOT NULL,
      tag TEXT NOT NULL,
      sex TEXT NOT NULL,
      breed TEXT,
      birthDate TEXT,
      updatedAt TEXT NOT NULL,
      version INTEGER NOT NULL
    );
  `);
}

/**
 * Execute a statement that does not return rows (INSERT/UPDATE/DELETE/DDL).
 * - On web: no-op (by design).
 * - `params` can be an array of positional values or a binding object,
 *   depending on the underlying driver. We use a defensive cast (`as any`)
 *   to support both shapes without changing the call sites.
 * - Always prefer parameterized queries to avoid SQL injection.
 */
export async function run(sql: string, params?: any[] | any): Promise<void> {
  if (isWeb) return;
  const db = await getDb();
  if (Array.isArray(params)) await db.runAsync(sql, params);
  else if (params !== undefined) await (db.runAsync as any)(sql, params);
  else await db.runAsync(sql);
}

/**
 * Execute a SELECT and return all rows as an array.
 * - Generic type `T` allows callers to strongly type the row shape.
 * - On web: returns an empty array (no SQLite available).
 * - `params` supports positional array or driver-specific binding object.
 * - Consider adding pagination (LIMIT/OFFSET) for large datasets.
 */
export async function getAll<T = any>(sql: string, params?: any[] | any): Promise<T[]> {
  if (isWeb) return [];
  const db = await getDb();
  if (Array.isArray(params)) return db.getAllAsync<T>(sql, params);
  else if (params !== undefined) return (db.getAllAsync as any)(sql, params);
  else return db.getAllAsync<T>(sql);
}
