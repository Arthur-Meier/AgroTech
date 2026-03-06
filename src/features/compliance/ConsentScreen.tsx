import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '@/ui/components/AppButton';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { t } from '@/core/i18n/strings';
import { getConsent, setConsent, type ConsentSnapshot } from '@/core/compliance/consent';
import { PRIVACY_POLICY_URL, PRIVACY_POLICY_VERSION } from '@/core/compliance/privacy';

const initialConsent: ConsentSnapshot = {
  analyticsEnabled: false,
  updatedAt: null,
};

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

export default function ConsentScreen() {
  const theme = useAppTheme();
  const [consent, setConsentState] = useState<ConsentSnapshot>(initialConsent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const consentDate = useMemo(() => formatDate(consent.updatedAt), [consent.updatedAt]);

  useEffect(() => {
    (async () => {
      try {
        const current = await getConsent();
        setConsentState(current);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave() {
    setSaving(true);
    try {
      const updated = await setConsent(consent.analyticsEnabled);
      setConsentState(updated);
      Alert.alert(t('app.consent'), t('consent.saved'));
    } catch {
      Alert.alert(t('app.consent'), t('consent.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('consent.title')}</Text>
        <Text style={[styles.description, { color: theme.colors.textMuted }]}>{t('consent.description')}</Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.colors.text }]}>{t('consent.analytics')}</Text>
            <Switch
              value={consent.analyticsEnabled}
              disabled={loading}
              onValueChange={(enabled) => setConsentState((prev) => ({ ...prev, analyticsEnabled: enabled }))}
            />
          </View>

          <Text style={[styles.metadata, { color: theme.colors.textMuted }]}>
            {t('consent.updatedAt', { date: consentDate })}
          </Text>
          <Text style={[styles.metadata, { color: theme.colors.textMuted }]}>
            {`Policy version: ${PRIVACY_POLICY_VERSION}`}
          </Text>

          <AppButton label={t('app.save')} onPress={onSave} loading={saving} fullWidth />
          <AppButton
            label={t('app.privacyPolicy')}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            kind="secondary"
            fullWidth
          />
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
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  metadata: {
    fontSize: 13,
  },
});
