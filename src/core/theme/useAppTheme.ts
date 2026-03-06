import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme } from './tokens';

/**
 * Small theme hook so screens can remain presentational and avoid repeating
 * `useColorScheme` + palette selection logic.
 */
export function useAppTheme(): Theme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
