import { Platform } from 'react-native';

type SQLiteModule = typeof import('expo-sqlite');
type SQLiteDatabase = import('expo-sqlite').SQLiteDatabase;

const isWeb = Platform.OS === 'web';

let sqliteModule: SQLiteModule | null = null;
let dbPromise: Promise<SQLiteDatabase> | null = null;

async function getModule(): Promise<SQLiteModule> {
  if (isWeb) throw new Error('SQLite is not available on web runtime.');
  if (!sqliteModule) sqliteModule = await import('expo-sqlite');
  return sqliteModule;
}

async function getDb(): Promise<SQLiteDatabase> {
  if (isWeb) throw new Error('SQLite is not available on web runtime.');
  if (!dbPromise) {
    const { openDatabaseAsync } = await getModule();
    dbPromise = openDatabaseAsync('pvf.db');
  }
  return dbPromise;
}

/**
 * Initializes the local database schema and applies additive migrations.
 *
 * `animals` stores domain entities for offline-first operation.
 * `app_settings` stores small key-value flags (consent, entitlement, etc.).
 */
export async function initDb(): Promise<void> {
  if (isWeb) return;
  const db = await getDb();

  await db.execAsync('PRAGMA journal_mode = WAL;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS animals (
      id TEXT PRIMARY KEY NOT NULL,
      tag TEXT NOT NULL,
      type TEXT NOT NULL,
      sex TEXT NOT NULL,
      breed TEXT,
      origin TEXT,
      lot TEXT,
      pasture TEXT,
      purchaseDate TEXT,
      birthDate TEXT,
      weightKg REAL,
      priceValue REAL,
      supplier TEXT,
      weaningDate TEXT,
      saleDate TEXT,
      buyer TEXT,
      sireTag TEXT,
      damTag TEXT,
      causeMortis TEXT,
      notes TEXT,
      pastureStartDate TEXT,
      confinementStartDate TEXT,
      updatedAt TEXT NOT NULL,
      version INTEGER NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(animals)');
  const hasColumn = (name: string) => columns.some((column) => column.name === name);

  const additiveColumns: [string, string][] = [
    ['type', 'TEXT'],
    ['origin', 'TEXT'],
    ['lot', 'TEXT'],
    ['pasture', 'TEXT'],
    ['purchaseDate', 'TEXT'],
    ['weightKg', 'REAL'],
    ['priceValue', 'REAL'],
    ['supplier', 'TEXT'],
    ['weaningDate', 'TEXT'],
    ['saleDate', 'TEXT'],
    ['buyer', 'TEXT'],
    ['sireTag', 'TEXT'],
    ['damTag', 'TEXT'],
    ['causeMortis', 'TEXT'],
    ['notes', 'TEXT'],
    ['pastureStartDate', 'TEXT'],
    ['confinementStartDate', 'TEXT'],
  ];

  for (const [name, sqlType] of additiveColumns) {
    if (!hasColumn(name)) {
      await db.execAsync(`ALTER TABLE animals ADD COLUMN ${name} ${sqlType};`);
    }
  }
}

export async function run(sql: string, params?: any[] | any): Promise<void> {
  if (isWeb) return;
  const db = await getDb();
  if (Array.isArray(params)) {
    await db.runAsync(sql, params);
    return;
  }

  if (params !== undefined) {
    await (db.runAsync as any)(sql, params);
    return;
  }

  await db.runAsync(sql);
}

export async function getAll<T = any>(sql: string, params?: any[] | any): Promise<T[]> {
  if (isWeb) return [];
  const db = await getDb();
  if (Array.isArray(params)) return db.getAllAsync<T>(sql, params);
  if (params !== undefined) return (db.getAllAsync as any)(sql, params);
  return db.getAllAsync<T>(sql);
}

export async function getSetting(key: string): Promise<string | null> {
  if (isWeb) return null;
  await initDb();
  const rows = await getAll<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ? LIMIT 1',
    [key]
  );
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (isWeb) return;
  await initDb();
  await run(
    'INSERT OR REPLACE INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)',
    [key, value, new Date().toISOString()]
  );
}
