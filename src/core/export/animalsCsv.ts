import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { Animal } from '@/domain/animal';

const CSV_HEADERS = [
  'id',
  'tag',
  'type',
  'sex',
  'breed',
  'origin',
  'birthDate',
  'weightKg',
  'sireTag',
  'damTag',
  'updatedAt',
];

function escapeCsv(value: string | number | undefined | null): string {
  const raw = value == null ? '' : String(value);
  if (!raw.includes(',') && !raw.includes('"') && !raw.includes('\n')) return raw;
  return `"${raw.replace(/"/g, '""')}"`;
}

export function buildAnimalsCsv(animals: Animal[]): string {
  const lines = animals.map((animal) =>
    [
      animal.id,
      animal.tag,
      animal.type,
      animal.sex,
      animal.breed,
      animal.origin,
      animal.birthDate,
      animal.weightKg,
      animal.sireTag,
      animal.damTag,
      animal.updatedAt,
    ]
      .map(escapeCsv)
      .join(',')
  );

  return [CSV_HEADERS.join(','), ...lines].join('\n');
}

/**
 * Exports and shares a CSV file on native platforms.
 * On web, it creates a download link for a local blob.
 */
export async function exportAnimalsCsv(animals: Animal[]): Promise<void> {
  const csv = buildAnimalsCsv(animals);

  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `animals-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const directory = FileSystem.documentDirectory;
  if (!directory) throw new Error('Document directory is unavailable.');

  const fileUri = `${directory}animals-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
}
