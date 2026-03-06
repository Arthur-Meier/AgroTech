import {
  __private__,
  countAnimals,
  getAnimalById,
  listAnimals,
  upsertAnimal,
} from '@/data/animal.repo';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string) {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.map.set(key, value);
  }

  clear() {
    this.map.clear();
  }
}

describe('animal.repo', () => {
  beforeEach(() => {
    const localStorage = new MemoryStorage();
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorage,
      configurable: true,
      writable: true,
    });
  });

  it('creates an animal and normalizes fields', async () => {
    const created = await upsertAnimal({
      tag: '  BR-001  ',
      type: 'BEZERRO',
      sex: 'M',
      birthDate: '2025-01-01',
    });

    expect(created.tag).toBe('BR-001');
    expect(created.sex).toBe('M');
    expect(created.version).toBe(1);
    expect(created.birthDate).toBe('2025-01-01');
  });

  it('updates an existing animal and increments version', async () => {
    const created = await upsertAnimal({
      tag: 'BR-001',
      type: 'BEZERRO',
      sex: 'M',
    });

    const updated = await upsertAnimal({
      id: created.id,
      tag: 'BR-001',
      type: 'NOVILHO',
      sex: 'M',
      version: created.version,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.type).toBe('NOVILHO');
    expect(updated.version).toBe(created.version + 1);
  });

  it('lists and counts animals in descending updatedAt', async () => {
    const first = await upsertAnimal({
      tag: 'BR-1',
      type: 'BEZERRO',
      sex: 'F',
    });
    const second = await upsertAnimal({
      tag: 'BR-2',
      type: 'MATRIZ',
      sex: 'F',
    });

    const list = await listAnimals();
    const total = await countAnimals();

    expect(total).toBe(2);
    expect(list[0].id).toBe(second.id);
    expect(list[1].id).toBe(first.id);
  });

  it('gets animal by id', async () => {
    const created = await upsertAnimal({
      tag: 'BR-55',
      type: 'ENGORDA',
      sex: 'M',
    });

    const found = await getAnimalById(created.id);
    expect(found?.id).toBe(created.id);
  });

  it('throws for invalid date format', async () => {
    await expect(
      upsertAnimal({
        tag: 'BR-3',
        type: 'BEZERRO',
        sex: 'F',
        birthDate: '01-01-2025',
      })
    ).rejects.toThrow('INVALID_DATE_FORMAT');
  });

  it('throws for empty tag', async () => {
    await expect(
      upsertAnimal({
        tag: '  ',
        type: 'BEZERRO',
        sex: 'F',
      })
    ).rejects.toThrow('TAG_REQUIRED');
  });

  it('normalizes helpers as expected', () => {
    expect(__private__.normalizeDateInput('2025-02-02')).toBe('2025-02-02');
    expect(() => __private__.normalizeDateInput('2025/02/02')).toThrow('INVALID_DATE_FORMAT');
    expect(__private__.normalizeSex('M')).toBe('M');
    expect(__private__.normalizeSex('F')).toBe('F');
  });
});
