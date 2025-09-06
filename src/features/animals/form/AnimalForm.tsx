/**
 * AnimalForm Screen (React Native)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Create or edit an Animal record.
 *  - If `route.params?.id` is present, loads the existing record for editing;
 *    otherwise behaves as a creation form.
 *
 * DATA FLOW
 *  - Read (edit mode): direct SQL via `withDb` to fetch a single row by `id`.
 *  - Write: repository function `upsertAnimal` (native: SQLite; web: localStorage).
 *
 * UX NOTES
 *  - Minimal validation: requires `tag`; defaults sex to 'F' unless user types 'M'.
 *  - Birth date is free-text ISO (YYYY-MM-DD) for now; consider a date picker later.
 *
 * ROUTING
 *  - Typed with `RouteProp<RootStackParamList, 'AnimalForm'>` to ensure params
 *    stay in sync with the navigation config.
 *
 * Last reviewed: 2025-09-04
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
// Repository function encapsulates persistence details (SQLite vs Web).
import { upsertAnimal } from '@/data/animal.repo';
// Low-level helper to run a single SQL transaction/statement.
import { getAll } from '@/core/db/sqlite';
// Domain interface used to type the row fetched from SQLite.
import type { Animal } from '@/domain/animal';
// React Navigation hooks for reading params and navigating back.
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
// Stack param list ensures route names/params are type-safe.
import type { RootStackParamList } from '@/app/navigation';

// Strongly typed route props for this screen.
type Props = RouteProp<RootStackParamList, 'AnimalForm'>;

export default function AnimalForm() {
  // Imperative navigation helper (back after save).
  const nav = useNavigation<any>();
  // Access route params (e.g., optional `id` in edit mode).
  const route = useRoute<Props>();
  // Local component state mirrors the Animal shape for the form.
  const [id, setId] = useState<string | undefined>(route.params?.id);
  const [tag, setTag] = useState('');
  const [sex, setSex] = useState<'M'|'F'>('F');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // On mount (and when `id` changes), load the existing record for editing.
  useEffect(() => {
    async function load() {
      if (!id) return;
      const rows = await getAll<Animal>('SELECT * FROM animals WHERE id = ?', [id]);
      if (rows.length) {
        const a = rows[0];
        setTag(a.tag);
        setSex((a.sex as 'M'|'F') ?? 'F');
        setBreed(a.breed ?? '');
        setBirthDate(a.birthDate ?? '');
      }
    }
    load();
  }, [id]);

  // Persist the form as a create/update operation.
  async function save() {
    // Simple validation: require identification/tag.
    if (!tag.trim()) {
      Alert.alert('Validação', 'Informe a identificação (brinco).');
      return;
    }
    // Delegate persistence to the repository; it normalizes fields and versioning.
    await upsertAnimal({ id, tag: tag.trim(), sex, breed: breed || undefined, birthDate: birthDate || undefined });
    // Navigate back to the previous screen once saved.
    nav.goBack();
  }

  // Simple, inline-styled form. Consider extracting to styled components later.
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Identificação</Text>
        <TextInput
          placeholder="Brinco/Tag"
          value={tag}
          onChangeText={setTag}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        />
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Sexo (M/F)</Text>
        <TextInput
          placeholder="F ou M"
          value={sex}
          onChangeText={(v) => setSex((v.trim().toUpperCase() === 'M') ? 'M' : 'F')}
          autoCapitalize="characters"
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        />
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Raça (opcional)</Text>
        <TextInput
          placeholder="Ex.: Angus"
          value={breed}
          onChangeText={setBreed}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        />
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Nascimento (ISO opcional)</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          value={birthDate}
          onChangeText={setBirthDate}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        />
      </View>

      <Pressable
        onPress={save}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#2563eb' : '#3b82f6',
          padding: 12, borderRadius: 12, alignSelf: 'flex-start'
        })}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>{id ? 'Salvar' : 'Criar'}</Text>
      </Pressable>
    </View>
  );
}
