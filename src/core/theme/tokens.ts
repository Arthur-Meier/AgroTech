/**
 * Centralized theme tokens for mobile-first UI consistency.
 * We keep values simple and explicit to avoid style drift across screens.
 */
export type ThemePalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
  danger: string;
  success: string;
};

export type Theme = {
  isDark: boolean;
  colors: ThemePalette;
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    body: number;
    caption: number;
    title: number;
  };
};

const baseSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

const baseRadius = {
  sm: 8,
  md: 12,
  lg: 16,
};

const baseTypography = {
  body: 16,
  caption: 13,
  title: 20,
};

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#f9fafb',
    surface: '#ffffff',
    surfaceMuted: '#f3f4f6',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    primary: '#1d4ed8',
    primaryMuted: '#dbeafe',
    danger: '#b91c1c',
    success: '#15803d',
  },
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography,
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#0f172a',
    surface: '#111827',
    surfaceMuted: '#1f2937',
    border: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    primary: '#60a5fa',
    primaryMuted: '#1e3a8a',
    danger: '#f87171',
    success: '#4ade80',
  },
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography,
};
