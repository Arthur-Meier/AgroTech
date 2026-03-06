import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { useAppTheme } from '@/core/theme/useAppTheme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  kind?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  kind = 'primary',
  fullWidth = false,
  style,
}: Props) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      bg: theme.colors.primary,
      text: '#ffffff',
      border: theme.colors.primary,
      pressed: theme.colors.primaryMuted,
    },
    secondary: {
      bg: theme.colors.surfaceMuted,
      text: theme.colors.text,
      border: theme.colors.border,
      pressed: theme.colors.primaryMuted,
    },
    ghost: {
      bg: 'transparent',
      text: theme.colors.text,
      border: 'transparent',
      pressed: theme.colors.surfaceMuted,
    },
  }[kind];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          borderColor: palette.border,
          backgroundColor: isDisabled ? theme.colors.surfaceMuted : pressed ? palette.pressed : palette.bg,
          opacity: isDisabled ? 0.7 : 1,
          alignSelf: fullWidth ? 'stretch' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.text} />
      ) : (
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});
