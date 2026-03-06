import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/app/navigation';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { t } from '@/core/i18n/strings';
import AppButton from '@/ui/components/AppButton';

type Nav = {
  navigate: (screen: keyof RootStackParamList) => void;
};

export default function BottomNav() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <View style={styles.row}>
        <AppButton
          label={t('app.animals')}
          onPress={() => navigation.navigate('Animals')}
          kind={route.name === 'Animals' ? 'primary' : 'secondary'}
          style={styles.navButton}
        />
        <AppButton
          label={t('app.newAnimal')}
          onPress={() => navigation.navigate('AnimalForm')}
          kind={route.name === 'AnimalForm' ? 'primary' : 'secondary'}
          style={styles.navButton}
        />
        <AppButton
          label={t('app.settings')}
          onPress={() => navigation.navigate('Settings')}
          kind={route.name === 'Settings' ? 'primary' : 'secondary'}
          style={styles.navButton}
        />
      </View>
      <Text style={[styles.caption, { color: theme.colors.textMuted }]}>Mobile-first offline MVP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  caption: {
    fontSize: 11,
    textAlign: 'center',
  },
  navButton: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
  },
});
