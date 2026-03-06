import { Platform } from 'react-native';
import { getAll, initDb, run } from '@/core/db/sqlite';
import type { Animal, AnimalType, Sex } from '@/domain/animal';

const isWeb = Platform.OS === 'web';
const STORAGE_KEY = 'pvf.animals';

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function normalizeDateInput(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(trimmed)) throw new Error('INVALID_DATE_FORMAT');
  return trimmed;
}

function normalizeSex(value: Sex): Sex {
  return value === 'M' ? 'M' : 'F';
}

function loadWeb(): Animal[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Animal[]) : [];
  } catch {
    return [];
  }
}

function saveWeb(list: Animal[]) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // no-op for storage quota/runtime failures
  }
}

export async function listAnimals(): Promise<Animal[]> {
  if (isWeb) {
    const list = loadWeb();
    return list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }

  await initDb();
  return getAll<Animal>(`
    SELECT
      id,
      tag,
      type,
      sex,
      breed,
      origin,
      lot,
      pasture,
      purchaseDate,
      birthDate,
      weightKg,
      priceValue,
      supplier,
      weaningDate,
      saleDate,
      buyer,
      sireTag,
      damTag,
      causeMortis,
      notes,
      pastureStartDate,
      confinementStartDate,
      updatedAt,
      version
    FROM animals
    ORDER BY datetime(updatedAt) DESC, tag ASC
  `);
}

export async function countAnimals(): Promise<number> {
  if (isWeb) return loadWeb().length;
  await initDb();
  const rows = await getAll<{ count: number }>('SELECT COUNT(*) as count FROM animals');
  return Number(rows[0]?.count ?? 0);
}

export async function getAnimalById(id: string): Promise<Animal | undefined> {
  if (isWeb) return loadWeb().find((animal) => animal.id === id);

  await initDb();
  const rows = await getAll<Animal>('SELECT * FROM animals WHERE id = ?', [id]);
  return rows[0];
}

type UpsertInput = Partial<Animal> & {
  id?: string;
  tag: string;
  type: AnimalType;
  sex: Sex;
};

/**
 * Upsert operation with minimal normalization/validation.
 *
 * Business rules:
 * - `tag` is mandatory and trimmed.
 * - `sex` is normalized to the accepted union.
 * - date inputs must stay in `YYYY-MM-DD` format.
 */
export async function upsertAnimal(input: UpsertInput): Promise<Animal> {
  const normalizedTag = input.tag.trim();
  if (!normalizedTag) throw new Error('TAG_REQUIRED');

  const id = input.id ?? newId();

  const entity: Animal = {
    id,
    tag: normalizedTag,
    type: input.type,
    sex: normalizeSex(input.sex),
    breed: input.breed?.trim() || undefined,
    origin: input.origin?.trim() || undefined,
    lot: input.lot?.trim() || undefined,
    pasture: input.pasture?.trim() || undefined,
    purchaseDate: normalizeDateInput(input.purchaseDate),
    birthDate: normalizeDateInput(input.birthDate),
    weightKg: input.weightKg ?? undefined,
    priceValue: input.priceValue ?? undefined,
    supplier: input.supplier?.trim() || undefined,
    weaningDate: normalizeDateInput(input.weaningDate),
    saleDate: normalizeDateInput(input.saleDate),
    buyer: input.buyer?.trim() || undefined,
    sireTag: input.sireTag?.trim() || undefined,
    damTag: input.damTag?.trim() || undefined,
    causeMortis: input.causeMortis?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    pastureStartDate: normalizeDateInput(input.pastureStartDate),
    confinementStartDate: normalizeDateInput(input.confinementStartDate),
    updatedAt: nowIso(),
    version: (typeof input.version === 'number' ? input.version : 0) + 1,
  };

  if (isWeb) {
    const list = loadWeb();
    const index = list.findIndex((animal) => animal.id === entity.id);
    if (index >= 0) list[index] = entity;
    else list.unshift(entity);
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
      entity.id,
      entity.tag,
      entity.type,
      entity.sex,
      entity.breed ?? null,
      entity.origin ?? null,
      entity.lot ?? null,
      entity.pasture ?? null,
      entity.purchaseDate ?? null,
      entity.birthDate ?? null,
      entity.weightKg ?? null,
      entity.priceValue ?? null,
      entity.supplier ?? null,
      entity.weaningDate ?? null,
      entity.saleDate ?? null,
      entity.buyer ?? null,
      entity.sireTag ?? null,
      entity.damTag ?? null,
      entity.causeMortis ?? null,
      entity.notes ?? null,
      entity.pastureStartDate ?? null,
      entity.confinementStartDate ?? null,
      entity.updatedAt,
      entity.version,
    ]
  );

  return entity;
}

// Internal exports exposed for unit tests.
export const __private__ = {
  normalizeDateInput,
  normalizeSex,
};
