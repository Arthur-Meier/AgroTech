import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BottomNav() {
  const nav = useNavigation<any>();
  return (
    <View style={{
      borderTopWidth: 1, borderColor: '#e5e7eb', paddingTop: 10, marginTop: 6
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Pressable
          onPress={() => nav.navigate('Animals')}
          style={({ pressed }) => ({
            flex: 1, padding: 12, borderRadius: 12,
            borderWidth: 1, borderColor: '#e5e7eb',
            backgroundColor: pressed ? '#f3f4f6' : '#fff', alignItems: 'center'
          })}
        >
          <Text style={{ fontWeight: '600' }}>Animais</Text>
        </Pressable>

        <Pressable
          onPress={() => nav.navigate('AnimalForm')}
          style={({ pressed }) => ({
            flex: 1, padding: 12, borderRadius: 12,
            borderWidth: 1, borderColor: '#e5e7eb',
            backgroundColor: pressed ? '#eef2ff' : '#eef2ff', alignItems: 'center'
          })}
        >
          <Text style={{ fontWeight: '700' }}>Cadastrar</Text>
        </Pressable>

        {/* Espaços para telas futuras */}
        <Pressable
          onPress={() => {}}
          style={{
            flex: 1, padding: 12, borderRadius: 12,
            borderWidth: 1, borderColor: '#e5e7eb',
            backgroundColor: '#fff', alignItems: 'center', opacity: 0.5
          }}
        >
          <Text>Relatórios</Text>
        </Pressable>
      </View>
    </View>
  );
}
