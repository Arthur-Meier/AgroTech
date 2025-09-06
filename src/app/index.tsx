/**
 * App Entry Point (React Native + Expo)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Define the top-level React component loaded by the native runtime (Expo).
 *  - Register global providers that must wrap the entire application tree.
 *  - Mount the navigation container that manages screen state and transitions.
 *
 * SCOPE & NON-FUNCTIONAL NOTES
 *  - iOS-first: This file remains platform-neutral, but our initial focus is
 *    iOS. Avoid platform-specific logic here; prefer encapsulating that within
 *    screens or platform modules.
 *  - Subscriptions later: When we add IAP/subscriptions, their state providers
 *    (e.g., purchase listeners) may also be registered here so navigation can
 *    react to entitlement changes. We are NOT changing behavior now — comments
 *    only — but this is the right location to wire global concerns in the
 *    future (analytics, theming, query cache, Redux, i18n, etc.).
 *
 * MAINTAINABILITY
 *  - Keep imports explicit and side-effect imports (like crypto polyfills)
 *    near the top so they load before any code that depends on them.
 *  - Keep comments in English to aid future contributors.
 *
 * Last reviewed: 2025-09-03
 */

import React from 'react';
// Navigation container provides navigation state, linking, and theming contexts
// for the entire app. It must wrap the stack/tab navigators.
import { NavigationContainer } from '@react-navigation/native';
// SafeAreaProvider ensures content respects notches, status bars, and home
// indicators on iOS/Android. Wrap the whole app once at the top level.
import { SafeAreaProvider } from 'react-native-safe-area-context';
// AppNavigator defines the stack of screens and transitions (declared in
// ./navigation). Keeping navigator logic isolated improves testability.
import { AppNavigator } from './navigation';
// Expo's managed StatusBar component. `style="auto"` follows the platform theme
// (light/dark) automatically. You may override per-screen as needed.
import { StatusBar } from 'expo-status-bar';
// Side-effect import: polyfills `crypto.getRandomValues` in React Native.
// Many libraries (e.g., `uuid`) require this. Keep it BEFORE any import that
// would use crypto so it initializes in time. Safe to import once globally.
import 'react-native-get-random-values';

/**
 * Default exported root component.
 * - Expo expects a default export from the entry file (commonly App.tsx or
 *   index.tsx). This function composes global providers and the navigator.
 * - Add additional providers here as the app grows (state management, query
 *   caching, payments, analytics). Keep provider order intentional:
 *     SafeAreaProvider -> Theme/Localization -> State -> Navigation -> Screens
 */
export default function App() {
  return (
    // Provides insets so children can avoid unsafe areas (notch, status bar).
    <SafeAreaProvider>
      {/**
       * NavigationContainer is required once at the root. It manages the
       * navigation tree, deep linking, back button integration, and exposes
       * imperative navigation helpers via refs if needed.
       *
       * Future (no changes now):
       *  - Provide a `theme` prop for light/dark themes.
       *  - Provide a `linking` prop to handle deep links (e.g., marketing URLs
       *    or universal links) so external links open the correct screen.
       *  - Use `initialState`/`onStateChange` for hydration/analytics.
       */}
      <NavigationContainer>
        {/**
         * Global StatusBar for the app. `style="auto"` lets the system decide
         * based on the current theme and background. Individual screens may
         * still override this if necessary.
         */}
        <StatusBar style="auto" />
        {/**
         * AppNavigator holds the stack(s)/tabs of screens. Keep screen
         * registration and per-screen options in ./navigation to separate
         * concerns and reduce churn in the entry file.
         */}
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
