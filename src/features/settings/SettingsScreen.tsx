import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppButton from '@/ui/components/AppButton';
import StateCard from '@/ui/components/StateCard';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { t } from '@/core/i18n/strings';
import { useEntitlement } from '@/core/iap/entitlements';
import { FREE_PLAN_LIMITS } from '@/core/product/limits';
import { listAnimals } from '@/data/animal.repo';
import { exportAnimalsCsv } from '@/core/export/animalsCsv';
import { trackEvent } from '@/core/telemetry/analytics';
import BottomNav from '@/ui/components/BottomNav';
import { captureError } from '@/core/observability/sentry';

type AppNavigation = {
  navigate: (screen: 'Paywall' | 'Consent', params?: Record<string, string>) => void;
};

export default function SettingsScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<AppNavigation>();
  const { entitlement, loading } = useEntitlement();
  const [exporting, setExporting] = useState(false);

  const planLabel = useMemo(() => {
    if (entitlement === 'free') return t('app.freePlan');
    if (entitlement === 'pro') return t('app.proPlan');
    return 'Enterprise';
  }, [entitlement]);

  async function onExportCsv() {
    setExporting(true);
    try {
      const animals = await listAnimals();
      await exportAnimalsCsv(animals);
      await trackEvent('animals_export_csv', { source: 'settings' });
      Alert.alert(t('app.export'), t('animals.exportSuccess'));
    } catch (error) {
      captureError(error, { scope: 'settings_export' });
      Alert.alert(t('app.export'), t('animals.exportError'));
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('settings.title')}</Text>

        <StateCard
          title={t('settings.section.plan')}
          body={`${t('settings.currentEntitlement', { plan: planLabel })}\n${t('settings.freeLimits', {
            maxAnimals: FREE_PLAN_LIMITS.maxAnimals,
          })}`}
        />

        <View style={styles.cardActions}>
          <AppButton
            label={t('app.openPaywall')}
            onPress={() => navigation.navigate('Paywall', { source: 'settings' })}
            disabled={loading}
            fullWidth
          />
        </View>

        <StateCard
          title={t('settings.section.compliance')}
          body={t('consent.description')}
          actionLabel={t('app.consent')}
          onAction={() => navigation.navigate('Consent')}
        />

        <StateCard title={t('settings.section.data')} body={t('app.export')} />
      <View style={styles.cardActions}>
          <AppButton
            label={t('app.export')}
            onPress={onExportCsv}
            loading={exporting}
            fullWidth
            kind="secondary"
          />
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  cardActions: {
    gap: 8,
  },
});
