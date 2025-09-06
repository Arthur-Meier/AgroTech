/**
 * AnimalsScreen (list & navigation)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Display the list of animals ordered by most recently updated (repo handles).
 *  - Provide entry points to create a new animal or edit an existing one.
 *
 * DATA FLOW
 *  - `initDb()` ensures the SQLite schema exists on native before listing.
 *  - `listAnimals()` abstracts persistence (SQLite on native, localStorage on web).
 *  - Local state `items` holds the current list to render.
 *
 * LIFECYCLE
 *  - `useEffect(..., [])` loads once when the screen mounts.
 *  - `useFocusEffect` loads again whenever the screen regains focus (e.g., after
 *     returning from the form), keeping the list fresh without manual refresh.
 *
 * RENDERING & PERFORMANCE
 *  - Uses `FlashList` (Shopify) for efficient large lists in React Native.
 *  - `estimatedItemSize` helps FlashList precompute layouts for smooth scrolling.
 *
 * UX
 *  - Primary action: "+ Novo animal" opens the AnimalForm in creation mode.
 *  - Each list row navigates to AnimalForm with the selected `id` for editing.
 *  - Empty state message is shown when there are no animals.
 *
 * Last reviewed: 2025-09-04
 */

import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
// Repository read op (backend-agnostic: SQLite/native, localStorage/web)
import { listAnimals } from '@/data/animal.repo';
import type { Animal } from '@/domain/animal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// Ensures DB schema exists before any queries on native platforms.
import { initDb } from '@/core/db/sqlite';

export default function AnimalsScreen() {
  // Local state with the currently loaded animals.
  const [items, setItems] = useState<Animal[]>([]);
  // Imperative navigation helper.
  const nav = useNavigation<any>();

  // Load routine: ensure schema, then fetch list, then update UI state.
  async function load() {
    await initDb(); // garante schema
    const data = await listAnimals();
    setItems(data);
  }

  // Initial load on mount.
  useEffect(() => { load(); }, []);
  // Reload whenever screen regains focus (e.g., after save on form screen).
  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {/* New item CTA: navigates to the form without an id (create mode). */}
      <Pressable
        onPress={() => nav.navigate('AnimalForm')}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#e5e7eb' : '#f3f4f6',
          padding: 12, borderRadius: 12, alignSelf: 'flex-start'
        })}
      >
        <Text style={{ fontWeight: '600' }}>+ Novo animal</Text>
      </Pressable>

      {items.length === 0 ? (
        // Empty state: centered, subtle hint.
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Nenhum animal cadastrado.</Text>
        </View>
      ) : (
        // Efficient list for RN. Each row is tappable to edit the item.
        <FlashList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => nav.navigate('AnimalForm', { id: item.id })}
              style={({ pressed }) => ({
                padding: 12, borderRadius: 12, marginBottom: 8,
                backgroundColor: pressed ? '#f9fafb' : '#fff',
                borderWidth: 1, borderColor: '#e5e7eb'
              })}
            >
              <Text style={{ fontWeight: '700' }}>{item.tag}</Text>
              <Text style={{ color: '#6b7280' }}>{item.sex}{item.breed ? ` • ${item.breed}` : ''}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
