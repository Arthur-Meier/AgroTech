import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '@/ui/components/AppButton';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { t } from '@/core/i18n/strings';
import { trackEvent } from '@/core/telemetry/analytics';
import { useEntitlement } from '@/core/iap/entitlements';
import { useNavigation, useRoute } from '@react-navigation/native';

type RouteParams = { source?: string };

export default function PaywallScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as RouteParams | undefined) ?? {};
  const { setEntitlement } = useEntitlement();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackEvent('paywall_view', { source: params.source ?? 'unknown' });
  }, [params.source]);

  async function activateProStub() {
    setLoading(true);
    try {
      await setEntitlement('pro');
      await trackEvent('paywall_cta_tap', { source: params.source ?? 'unknown' });
      Alert.alert('Plano Pro', 'Plano Pro ativado em modo stub para validacao.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('paywall.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('paywall.subtitle')}</Text>

          <View style={styles.benefits}>
            <Text style={[styles.benefit, { color: theme.colors.text }]}>{`\u2022 ${t('paywall.benefit.limit')}`}</Text>
            <Text style={[styles.benefit, { color: theme.colors.text }]}>{`\u2022 ${t('paywall.benefit.export')}`}</Text>
            <Text style={[styles.benefit, { color: theme.colors.text }]}>{`\u2022 ${t('paywall.benefit.support')}`}</Text>
          </View>

          <AppButton label={t('paywall.cta')} onPress={activateProStub} loading={loading} fullWidth />
          <AppButton label={t('paywall.close')} onPress={() => navigation.goBack()} kind="secondary" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  benefits: {
    gap: 8,
  },
  benefit: {
    fontSize: 15,
    lineHeight: 22,
  },
});
