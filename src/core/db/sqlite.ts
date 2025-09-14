// Pequena camada sobre expo-sqlite (nativo). Na Web, no-op (usa localStorage no repo).
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
type SQLiteModule = typeof import('expo-sqlite');
type SQLiteDatabase = import('expo-sqlite').SQLiteDatabase;

let sqliteMod: SQLiteModule | null = null;
let dbPromise: Promise<SQLiteDatabase> | null = null;

async function getMod(): Promise<SQLiteModule> {
  if (isWeb) throw new Error('SQLite indisponível no Web.');
  if (!sqliteMod) sqliteMod = await import('expo-sqlite');
  return sqliteMod;
}

async function getDb(): Promise<SQLiteDatabase> {
  if (isWeb) throw new Error('SQLite indisponível no Web.');
  if (!dbPromise) {
    const { openDatabaseAsync } = await getMod();
    dbPromise = openDatabaseAsync('pvf.db');
  }
  return dbPromise;
}

/**
 * initDb
 * - Cria tabela `animals` (se não existir) com o schema completo.
 * - Migra versões antigas adicionando colunas que faltarem (ALTER TABLE ...).
 */
export async function initDb(): Promise<void> {
  if (isWeb) return;
  const db = await getDb();

  await db.execAsync(`PRAGMA journal_mode = WAL;`);

  // Tabela completa (criação)
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

  // Migração aditiva (para DB já existente com colunas antigas)
  const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(animals)`);
  const has = (c: string) => cols.some(x => x.name === c);

  const addIfMissing: Array<[string, string]> = [
    ['type','TEXT'], ['origin','TEXT'], ['lot','TEXT'], ['pasture','TEXT'],
    ['purchaseDate','TEXT'], ['weightKg','REAL'], ['priceValue','REAL'],
    ['supplier','TEXT'], ['weaningDate','TEXT'], ['saleDate','TEXT'],
    ['buyer','TEXT'], ['sireTag','TEXT'], ['damTag','TEXT'], ['causeMortis','TEXT'],
    ['notes','TEXT'], ['pastureStartDate','TEXT'], ['confinementStartDate','TEXT']
  ];

  for (const [name, sqlType] of addIfMissing) {
    if (!has(name)) {
      await db.execAsync(`ALTER TABLE animals ADD COLUMN ${name} ${sqlType};`);
    }
  }
}

// Helpers simples
export async function run(sql: string, params?: any[] | any): Promise<void> {
  if (isWeb) return;
  const db = await getDb();
  if (Array.isArray(params)) await db.runAsync(sql, params);
  else if (params !== undefined) await (db.runAsync as any)(sql, params);
  else await db.runAsync(sql);
}

export async function getAll<T = any>(sql: string, params?: any[] | any): Promise<T[]> {
  if (isWeb) return [];
  const db = await getDb();
  if (Array.isArray(params)) return db.getAllAsync<T>(sql, params);
  else if (params !== undefined) return (db.getAllAsync as any)(sql, params);
  else return db.getAllAsync<T>(sql);
}
