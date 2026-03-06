import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/navigation';
import { listAnimals } from '@/data/animal.repo';
import type { Animal } from '@/domain/animal';
import BottomNav from '@/ui/components/BottomNav';
import AppButton from '@/ui/components/AppButton';
import StateCard from '@/ui/components/StateCard';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { t } from '@/core/i18n/strings';
import { useEntitlement } from '@/core/iap/entitlements';
import { canCreateAnimal, canExportCsv } from '@/core/product/limits';
import { exportAnimalsCsv } from '@/core/export/animalsCsv';
import { trackEvent } from '@/core/telemetry/analytics';
import { captureError } from '@/core/observability/sentry';

function ageFrom(birth?: string): string {
  if (!birth) return '-';
  const date = new Date(`${birth}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '-';

  const now = new Date();
  let years = now.getUTCFullYear() - date.getUTCFullYear();
  let months = now.getUTCMonth() - date.getUTCMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0 && months <= 0) return '0m';
  return years > 0 ? `${years}a ${months}m` : `${months}m`;
}

function fmtDate(iso?: string): string {
  if (!iso) return '-';
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '-';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function formatOrigin(origin?: string): string {
  if (!origin) return '-';
  if (origin === 'BIRTH') return t('animalForm.origin.option.birth');
  if (origin === 'PURCHASE') return t('animalForm.origin.option.purchase');
  if (origin === 'TRANSFER') return t('animalForm.origin.option.transfer');
  return origin;
}

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function AnimalsScreen() {
  const navigation = useNavigation<Navigation>();
  const theme = useAppTheme();
  const { entitlement } = useEntitlement();

  const [items, setItems] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createBlocked = !canCreateAnimal(entitlement, items.length);

  const load = useCallback(async () => {
    try {
      setErrorMessage(null);
      const data = await listAnimals();
      setItems(data);
    } catch (error) {
      captureError(error, { scope: 'animals_load' });
      setErrorMessage(t('animals.error.load'));
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    await load();
    setLoading(false);
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, [loadInitial])
  );

  async function onPressCreate() {
    if (!createBlocked) {
      navigation.navigate('AnimalForm');
      return;
    }

    await trackEvent('animals_create_blocked', { currentCount: items.length, entitlement });
    Alert.alert(t('validation.title'), t('animals.createBlocked'));
    navigation.navigate('Paywall', { source: 'animals_create' });
  }

  async function onPressExport() {
    if (!canExportCsv(entitlement)) {
      await trackEvent('animals_export_blocked', { entitlement });
      Alert.alert(t('app.export'), t('animals.exportBlocked'));
      navigation.navigate('Paywall', { source: 'animals_export' });
      return;
    }

    try {
      setExporting(true);
      await exportAnimalsCsv(items);
      await trackEvent('animals_export_csv', { source: 'animals_list' });
      Alert.alert(t('app.export'), t('animals.exportSuccess'));
    } catch (error) {
      captureError(error, { scope: 'animals_export' });
      Alert.alert(t('app.export'), t('animals.exportError'));
    } finally {
      setExporting(false);
    }
  }

  const header = useMemo(
    () => (
      <View style={[styles.headerCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('animals.list.title')}</Text>
        <Text style={[styles.headerBody, { color: theme.colors.textMuted }]}>
          {`Brinco | Tipo | Sexo | Raca | Origem | Nascimento | Idade | Peso`}
        </Text>
        {createBlocked ? (
          <Text style={[styles.limitText, { color: theme.colors.danger }]}>
            {`${t('animals.limitReached')} ${t('animals.upgradeHint')}`}
          </Text>
        ) : null}
      </View>
    ),
    [createBlocked, theme.colors.border, theme.colors.danger, theme.colors.surface, theme.colors.text, theme.colors.textMuted]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.actionRow}>
          <AppButton label={t('app.newAnimal')} onPress={onPressCreate} disabled={loading} />
          <AppButton
            label={t('app.export')}
            onPress={onPressExport}
            kind="secondary"
            loading={exporting}
            disabled={loading || items.length === 0}
          />
        </View>

        {loading ? (
          <StateCard title={t('app.loading')} body={t('animals.list.title')} />
        ) : errorMessage ? (
          <StateCard title={errorMessage} body={t('animals.list.title')} actionLabel={t('app.tryAgain')} onAction={loadInitial} />
        ) : items.length === 0 ? (
          <StateCard
            title={t('animals.empty.title')}
            body={t('animals.empty.body')}
            actionLabel={t('app.newAnimal')}
            onAction={onPressCreate}
          />
        ) : (
          <FlashList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={items}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={header}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            renderItem={({ item }) => (
              <View style={[styles.itemCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                <Text style={[styles.itemTag, { color: theme.colors.text }]}>{item.tag}</Text>
                <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>
                  {`${item.type} | ${item.sex} | ${item.breed ?? '-'}`}
                </Text>
                <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>
                  {`${formatOrigin(item.origin) ?? '-'} | ${fmtDate(item.birthDate)} | ${ageFrom(item.birthDate)} | ${item.weightKg != null ? `${item.weightKg} kg` : '-'}`}
                </Text>
                <View style={styles.itemActions}>
                  <AppButton
                    label={t('app.edit')}
                    onPress={() => navigation.navigate('AnimalForm', { id: item.id })}
                    kind="ghost"
                  />
                </View>
              </View>
            )}
          />
        )}
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
    gap: 8,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerBody: {
    fontSize: 12,
  },
  limitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  itemTag: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemActions: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
