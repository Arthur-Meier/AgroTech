import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { listAnimals } from '@/data/animal.repo';
import type { Animal } from '@/domain/animal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { initDb } from '@/core/db/sqlite';
import BottomNav from '@/ui/components/BottomNav';

function ageFrom(birth?: string): string {
  if (!birth) return '-';
  const d = new Date(birth + (birth.length === 10 ? 'T00:00:00Z' : ''));
  if (Number.isNaN(d.getTime())) return '-';
  const now = new Date();
  let years = now.getUTCFullYear() - d.getUTCFullYear();
  let months = now.getUTCMonth() - d.getUTCMonth();
  if (months < 0) { years -= 1; months += 12; }
  if (years <= 0 && months <= 0) return '0m';
  return years > 0 ? `${years}a ${months}m` : `${months}m`;
}

function fmtDate(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : ''));
  if (Number.isNaN(d.getTime())) return '-';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function AnimalsScreen() {
  const [items, setItems] = useState<Animal[]>([]);
  const nav = useNavigation<any>();

  async function load() {
    await initDb();
    const data = await listAnimals();
    setItems(data);
  }

  useEffect(() => { load(); }, []);
  useFocusEffect(useCallback(() => { load(); }, []));

  const header = useMemo(() => (
    <View style={{ paddingVertical: 8 }}>
      <Text style={{ fontWeight: '700', marginBottom: 8 }}>Lista de Animais</Text>
      <View style={{
        backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb',
        borderRadius: 10, padding: 8
      }}>
        <Text style={{ color: '#6b7280', fontSize: 12 }}>
          Colunas: Brinco • Tipo • Sexo • Raça • Origem • Nascimento • Idade • Peso • Brinco Pai • Brinco Mãe
        </Text>
      </View>
    </View>
  ), []);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Nenhum animal cadastrado.</Text>
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(it) => it.id}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => nav.navigate('AnimalForm', { id: item.id })}
              style={({ pressed }) => ({
                padding: 12, borderRadius: 12, marginBottom: 8,
                backgroundColor: pressed ? '#f9fafb' : '#fff',
                borderWidth: 1, borderColor: '#e5e7eb'
              })}
            >
              {/* Linha 1: Brinco • Tipo • Sexo • Raça */}
              <Text style={{ fontWeight: '700' }}>
                {item.tag}
                <Text style={{ fontWeight: '400', color: '#6b7280' }}>
                  {`  •  ${item.type ?? '-'}  •  ${item.sex ?? '-'}  •  ${item.breed ?? '-'}`}
                </Text>
              </Text>

              {/* Linha 2: Origem • Nascimento • Idade • Peso */}
              <Text style={{ color: '#374151' }}>
                {`${item.origin ?? '-'}  •  ${fmtDate(item.birthDate)}  •  ${ageFrom(item.birthDate)}  •  ${item.weightKg != null ? `${item.weightKg} kg` : '-'}`}
              </Text>

              {/* Linha 3: Brinco Pai • Brinco Mãe */}
              <Text style={{ color: '#6b7280' }}>
                {`Pai: ${item.sireTag ?? '-'}   •   Mãe: ${item.damTag ?? '-'}`}
              </Text>
            </Pressable>
          )}
        />
      )}

      {/* Navegação inferior simples */}
      <BottomNav />
    </View>
  );
}
