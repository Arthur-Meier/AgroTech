/**
 * App Navigation Stack (React Navigation / TypeScript)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Declare the app's screens and how the user moves between them.
 *  - Keep route names and params type‑safe.
 *
 * SCOPE OF THIS FILE
 *  - Root stack navigator for the mobile app (works on iOS and Android).
 *  - We are NOT changing any behavior here — only adding documentation comments.
 *
 * TECHNOLOGY CHOICE (context)
 *  - Using `@react-navigation/native-stack` provides native-feeling transitions
 *    and better performance on iOS/Android versus the JS stack.
 *
 * LANGUAGE & LONG‑TERM MAINTAINABILITY
 *  - Comments are **in English** so future contributors can understand decisions.
 *  - Try to keep route names, params, and component names in English as a rule.
 *    (Below, titles are currently Portuguese — see inline notes — and we are
 *     not altering them now by request.)
 *
 * SUBSCRIPTIONS / PAYWALL (future)
 *  - When adding in‑app purchases or subscriptions later, we can either:
 *      a) add paywall screens to this same stack, or
 *      b) create a separate Auth/Paywall stack and conditionally render it
 *         at the App root based on user state (e.g., subscribed vs. not).
 *
 * HOW TO ADD A SCREEN
 *  1) Create the screen component (e.g., `features/animals/details/AnimalDetails.tsx`).
 *  2) Add the route name and its params to `RootStackParamList` below.
 *  3) Register the screen with <Stack.Screen name="..." component={...} />.
 *  4) (Optional) Add `options={{ title: '...' }}` or a function to compute
 *     title/header buttons using route params.
 *
 * DEEP LINKING (future)
 *  - If marketing or OS links should open specific screens, define a `linking`
 *    config in the top-level <NavigationContainer> (usually in App.tsx).
 *
 * Last reviewed: 2025-09-03
 */
import React from 'react';
// Native-stack navigator gives platform-native transitions and header behavior.
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Feature screens (domain-first folder structure). Keep imports explicit.
import AnimalsScreen from '@/features/animals/list/AnimalsScreen';
import AnimalForm from '@/features/animals/form/AnimalForm';

/**
 * RootStackParamList
 * -----------------------------------------------------------------------------
 * Central type mapping route names to the params each route accepts.
 * - If a route has no params, use `undefined`.
 * - Prefer optional fields inside the object rather than unioning with undefined,
 *   unless you truly need to represent "no params" as a distinct state.
 *
 * Routes in this app (current):
 * - "Animals": no params. Entry list of animals/cattle.
 * - "AnimalForm": optional `{ id?: string }` — when `id` is provided, treat as
 *   "edit"; when `id` is absent, treat as "create".
 */
export type RootStackParamList = {
  Animals: undefined;
  AnimalForm: { id?: string } | undefined;
};

// Create the strongly-typed native stack instance tied to RootStackParamList.
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator
 * -----------------------------------------------------------------------------
 * The root stack for the app. You may later introduce nested navigators
 * (e.g., AuthStack, PaywallStack, Tabs) and render them conditionally in here
 * based on user state (e.g., onboarding completed, subscription active, etc.).
 *
 * NOTE: By request, we are not changing any code — only adding comments.
 * - The titles below are currently in Portuguese ("Animais", "Animal").
 *   If/when we standardize UI text to English, update `options.title` here or
 *   move titles to a localization system (i18n) so they are easily translated.
 */
export function AppNavigator() {
  return (
    <Stack.Navigator>
      {/**
       * Animals list screen
       * - Purpose: List and manage animals/cattle records.
       * - Navigation: From here you can push forms (create/edit) or details.
       * - Title is currently in Portuguese by design choice: 'Animais'.
       */}
      <Stack.Screen name="Animals" component={AnimalsScreen} options={{ title: 'Animais' }} />
      {/**
       * Animal create/edit form
       * - Params: `id?: string` (see RootStackParamList). If `id` exists, edit mode;
       *   if absent, creation mode. The screen component decides the mode.
       * - Title is currently in Portuguese by design choice: 'Animal'.
       */}
      <Stack.Screen name="AnimalForm" component={AnimalForm} options={{ title: 'Animal' }} />
    </Stack.Navigator>
  );
}
