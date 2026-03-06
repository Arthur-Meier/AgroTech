import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/useAppTheme';
import AppButton from './AppButton';

type Props = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function StateCard({ title, body, actionLabel, onAction }: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text>
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} fullWidth kind="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});
