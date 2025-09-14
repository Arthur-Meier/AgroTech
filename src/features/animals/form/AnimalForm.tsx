import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { upsertAnimal, getAnimalById } from '@/data/animal.repo';
import type { Sex, AnimalType, Animal } from '@/domain/animal';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/app/navigation';

type Props = RouteProp<RootStackParamList, 'AnimalForm'>;

function Segmented<T extends string>({
  value, options, onChange,
}: { value: T; options: { label: string; value: T }[]; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
              borderWidth: 1, borderColor: active ? '#2563eb' : '#d1d5db',
              backgroundColor: active ? '#dbeafe' : '#fff'
            }}
          >
            <Text style={{ fontWeight: active ? '700' : '500' }}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AnimalForm() {
  const nav = useNavigation<any>();
  const route = useRoute<Props>();
  const [id] = useState<string | undefined>(route.params?.id);

  // Campos principais
  const [tag, setTag] = useState('');
  const [type, setType] = useState<AnimalType>('BEZERRO');
  const [sex, setSex] = useState<Sex>('F');
  const [breed, setBreed] = useState('');
  const [origin, setOrigin] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weightKg, setWeightKg] = useState<string>(''); // mantemos como string e convertemos no save
  const [sireTag, setSireTag] = useState('');
  const [damTag, setDamTag] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      const a = await getAnimalById(id);
      if (!a) return;
      setTag(a.tag);
      setType(a.type);
      setSex(a.sex);
      setBreed(a.breed ?? '');
      setOrigin(a.origin ?? '');
      setBirthDate(a.birthDate ?? '');
      setWeightKg(a.weightKg != null ? String(a.weightKg) : '');
      setSireTag(a.sireTag ?? '');
      setDamTag(a.damTag ?? '');
      setNotes(a.notes ?? '');
    })();
  }, [id]);

  async function save() {
    if (!tag.trim()) {
      Alert.alert('Validação', 'Informe a identificação (Nº Brinco).');
      return;
    }
    const weight = weightKg.trim() ? Number(weightKg) : undefined;
    if (weightKg.trim() && Number.isNaN(weight)) {
      Alert.alert('Validação', 'Peso deve ser numérico (kg).');
      return;
    }

    await upsertAnimal({
      id, tag: tag.trim(), type, sex,
      breed: breed || undefined,
      origin: origin || undefined,
      birthDate: birthDate || undefined,
      weightKg: weight,
      sireTag: sireTag || undefined,
      damTag: damTag || undefined,
      notes: notes || undefined,
    });
    nav.goBack();
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Nº Brinco</Text>
        <TextInput
          placeholder="Identificação (tag)"
          value={tag}
          onChangeText={setTag}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        />
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Tipo</Text>
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { label: 'Bezerro', value: 'BEZERRO' },
            { label: 'Novilho', value: 'NOVILHO' },
            { label: 'Matriz',  value: 'MATRIZ'  },
            { label: 'Engorda', value: 'ENGORDA' },
          ]}
        />
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Sexo</Text>
        <Segmented
          value={sex}
          onChange={setSex}
          options={[
            { label: 'Fêmea', value: 'F' },
            { label: 'Macho', value: 'M' },
          ]}
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
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Origem (opcional)</Text>
        <TextInput
          placeholder="Compra / Nascimento / Transferência..."
          value={origin}
          onChangeText={setOrigin}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        />
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Nascimento (YYYY-MM-DD)</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          value={birthDate}
          onChangeText={setBirthDate}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        />
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Peso (kg)</Text>
        <TextInput
          placeholder="Ex.: 340"
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Brinco Pai</Text>
          <TextInput
            placeholder="Ex.: P-001"
            value={sireTag}
            onChangeText={setSireTag}
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Brinco Mãe</Text>
          <TextInput
            placeholder="Ex.: M-001"
            value={damTag}
            onChangeText={setDamTag}
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
          />
        </View>
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Observação</Text>
        <TextInput
          placeholder="Notas gerais"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, minHeight: 80 }}
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
