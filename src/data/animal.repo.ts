import { Platform } from 'react-native';
import { initDb, getAll, run } from '@/core/db/sqlite';
import type { Animal, Sex, AnimalType } from '@/domain/animal';

// Backend alterna: nativo usa SQLite; web usa localStorage.
const isWeb = Platform.OS === 'web';
const STORAGE_KEY = 'pvf.animals';

function nowIso() { return new Date().toISOString(); }
function newId() { return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`); }

// WEB (fallback) ---------------------------------------------------------------
function loadWeb(): Animal[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Animal[]) : [];
  } catch { return []; }
}
function saveWeb(list: Animal[]) {
  try { globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* noop */ }
}

// API -------------------------------------------------------------------------
export async function listAnimals(): Promise<Animal[]> {
  if (isWeb) {
    const list = loadWeb();
    return list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }
  await initDb();
  return getAll<Animal>(`
    SELECT id, tag, type, sex, breed, origin, birthDate, weightKg, sireTag, damTag, updatedAt, version
    FROM animals
    ORDER BY datetime(updatedAt) DESC, tag ASC
  `);
}

export async function getAnimalById(id: string): Promise<Animal | undefined> {
  if (isWeb) {
    return loadWeb().find(a => a.id === id);
  }
  await initDb();
  const rows = await getAll<Animal>(`SELECT * FROM animals WHERE id = ?`, [id]);
  return rows[0];
}

type UpsertInput = Partial<Animal> & {
  id?: string;
  tag: string;
  type: AnimalType;
  sex: Sex;
};

export async function upsertAnimal(input: UpsertInput): Promise<Animal> {
  const id = input.id ?? newId();
  const entity: Animal = {
    id,
    tag: input.tag.trim(),
    type: input.type,
    sex: input.sex,
    breed: input.breed ?? undefined,
    origin: input.origin ?? undefined,
    lot: input.lot ?? undefined,
    pasture: input.pasture ?? undefined,
    purchaseDate: input.purchaseDate ?? undefined,
    birthDate: input.birthDate ?? undefined,
    weightKg: input.weightKg ?? undefined,
    priceValue: input.priceValue ?? undefined,
    supplier: input.supplier ?? undefined,
    weaningDate: input.weaningDate ?? undefined,
    saleDate: input.saleDate ?? undefined,
    buyer: input.buyer ?? undefined,
    sireTag: input.sireTag ?? undefined,
    damTag: input.damTag ?? undefined,
    causeMortis: input.causeMortis ?? undefined,
    notes: input.notes ?? undefined,
    pastureStartDate: input.pastureStartDate ?? undefined,
    confinementStartDate: input.confinementStartDate ?? undefined,
    updatedAt: nowIso(),
    version: (typeof (input.version) === 'number' ? input.version : 0) + 1,
  };

  if (isWeb) {
    const list = loadWeb();
    const idx = list.findIndex(a => a.id === entity.id);
    if (idx >= 0) list[idx] = entity; else list.unshift(entity);
    saveWeb(list);
    return entity;
  }

  await initDb();
  await run(
    `INSERT OR REPLACE INTO animals (
      id, tag, type, sex, breed, origin, lot, pasture, purchaseDate, birthDate,
      weightKg, priceValue, supplier, weaningDate, saleDate, buyer, sireTag, damTag,
      causeMortis, notes, pastureStartDate, confinementStartDate, updatedAt, version
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      entity.id, entity.tag, entity.type, entity.sex, entity.breed ?? null, entity.origin ?? null,
      entity.lot ?? null, entity.pasture ?? null, entity.purchaseDate ?? null, entity.birthDate ?? null,
      entity.weightKg ?? null, entity.priceValue ?? null, entity.supplier ?? null, entity.weaningDate ?? null,
      entity.saleDate ?? null, entity.buyer ?? null, entity.sireTag ?? null, entity.damTag ?? null,
      entity.causeMortis ?? null, entity.notes ?? null, entity.pastureStartDate ?? null,
      entity.confinementStartDate ?? null, entity.updatedAt, entity.version
    ]
  );
  return entity;
}
