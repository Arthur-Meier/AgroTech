import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnimalsScreen from '@/features/animals/list/AnimalsScreen';
import AnimalForm from '@/features/animals/form/AnimalForm';
import SettingsScreen from '@/features/settings/SettingsScreen';
import PaywallScreen from '@/features/paywall/PaywallScreen';
import ConsentScreen from '@/features/compliance/ConsentScreen';

export type RootStackParamList = {
  Animals: undefined;
  AnimalForm: { id?: string } | undefined;
  Settings: undefined;
  Paywall: { source?: string } | undefined;
  Consent: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Animals">
      <Stack.Screen name="Animals" component={AnimalsScreen} options={{ title: 'Animais' }} />
      <Stack.Screen name="AnimalForm" component={AnimalForm} options={{ title: 'Cadastro de animal' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
      <Stack.Screen name="Paywall" component={PaywallScreen} options={{ title: 'Plano Pro' }} />
      <Stack.Screen name="Consent" component={ConsentScreen} options={{ title: 'Consentimento LGPD' }} />
    </Stack.Navigator>
  );
}
