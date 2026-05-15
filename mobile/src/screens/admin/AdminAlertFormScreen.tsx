import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { safetyAdminService } from '../../services/safety.service';
import { Severity } from '../../types/safety';

type ParamList = {
  AdminAlertForm: { alertId?: string };
};

const SEVERITIES: { key: Severity; color: string }[] = [
  { key: 'info', color: palette.info },
  { key: 'warning', color: palette.warning },
  { key: 'danger', color: palette.error },
];

const REGIONS = [
  'tunis', 'nord', 'nord-est', 'nord-ouest',
  'centre', 'centre-est', 'centre-ouest',
  'sud', 'sud-est', 'sud-ouest',
] as const;

export default function AdminAlertFormScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'AdminAlertForm'>>();
  const alertId = route.params?.alertId;
  const isEdit = !!alertId;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [titleFr, setTitleFr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [messageFr, setMessageFr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [messageAr, setMessageAr] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');
  const [region, setRegion] = useState<string | null>(null);
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [radius, setRadius] = useState('');
  const [expiresAt, setExpiresAt] = useState(''); // YYYY-MM-DD
  const [source, setSource] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!alertId) return;
    let cancelled = false;
    safetyAdminService
      .getOne(alertId)
      .then((a) => {
        if (cancelled) return;
        setTitleFr(a.title?.fr || '');
        setTitleEn(a.title?.en || '');
        setTitleAr(a.title?.ar || '');
        setMessageFr(a.message?.fr || '');
        setMessageEn(a.message?.en || '');
        setMessageAr(a.message?.ar || '');
        setSeverity(a.severity);
        setRegion(a.region || null);
        if (a.location?.coordinates) {
          setLongitude(String(a.location.coordinates[0]));
          setLatitude(String(a.location.coordinates[1]));
        }
        if (a.radius != null) setRadius(String(a.radius));
        if (a.expiresAt) setExpiresAt(a.expiresAt.slice(0, 10));
        setSource(a.source || '');
        setActive(a.active);
      })
      .catch((err: any) => {
        if (cancelled) return;
        Alert.alert(t('error'), err?.response?.data?.message || t('error'));
        navigation.goBack();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Only re-fetch on alertId change. `t` and `navigation` are intentionally
    // omitted: they are referentially unstable and would loop infinitely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertId]);

  const submit = async () => {
    // Minimal client validation; backend Joi does the rest
    if (!titleFr.trim() || !titleEn.trim() || !titleAr.trim()) {
      Alert.alert(t('error'), t('alertTitleAllLangsRequired'));
      return;
    }
    if (!messageFr.trim() || !messageEn.trim() || !messageAr.trim()) {
      Alert.alert(t('error'), t('alertMessageAllLangsRequired'));
      return;
    }

    const payload: any = {
      title: { fr: titleFr.trim(), en: titleEn.trim(), ar: titleAr.trim() },
      message: { fr: messageFr.trim(), en: messageEn.trim(), ar: messageAr.trim() },
      severity,
      active,
      source: source.trim() || undefined,
    };
    if (region) payload.region = region;
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (isFinite(lng) && isFinite(lat)) {
      payload.location = { type: 'Point', coordinates: [lng, lat] };
    }
    if (radius.trim()) {
      const r = parseInt(radius, 10);
      if (isFinite(r) && r > 0) payload.radius = r;
    }
    if (expiresAt.trim()) {
      const d = new Date(expiresAt);
      if (!isNaN(d.getTime())) payload.expiresAt = d.toISOString();
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        await safetyAdminService.update(alertId!, payload);
      } else {
        await safetyAdminService.create(payload);
      }
      Alert.alert(t('saved'), isEdit ? t('alertUpdated') : t('alertCreated'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.message || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.mediterraneanBlue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? t('editAlert') : t('createAlert')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Section title={t('title')}>
          <LangField label="FR" value={titleFr} onChange={setTitleFr} />
          <LangField label="EN" value={titleEn} onChange={setTitleEn} />
          <LangField label="AR" value={titleAr} onChange={setTitleAr} rtl />
        </Section>

        <Section title={t('message')}>
          <LangField label="FR" value={messageFr} onChange={setMessageFr} multiline />
          <LangField label="EN" value={messageEn} onChange={setMessageEn} multiline />
          <LangField label="AR" value={messageAr} onChange={setMessageAr} multiline rtl />
        </Section>

        <Section title={t('severity')}>
          <View style={styles.chipsRow}>
            {SEVERITIES.map((s) => {
              const isActive = severity === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.chip,
                    isActive && { backgroundColor: s.color, borderColor: s.color },
                  ]}
                  onPress={() => setSeverity(s.key)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {t(`severityLevels.${s.key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <Section title={t('region')}>
          <View style={styles.chipsGrid}>
            <TouchableOpacity
              style={[styles.chip, !region && styles.chipActive]}
              onPress={() => setRegion(null)}
            >
              <Text style={[styles.chipText, !region && styles.chipTextActive]}>
                {t('anyRegion')}
              </Text>
            </TouchableOpacity>
            {REGIONS.map((r) => {
              const isActive = region === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setRegion(isActive ? null : r)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {t(`regions.${r}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <Section title={t('geoTargetOptional')}>
          <Text style={styles.help}>{t('geoTargetHelp')}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('latitude')}</Text>
              <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                placeholder="36.8"
                placeholderTextColor={palette.gray400}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('longitude')}</Text>
              <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                placeholder="10.18"
                placeholderTextColor={palette.gray400}
              />
            </View>
          </View>
          <Text style={styles.label}>{t('radiusMeters')}</Text>
          <TextInput
            style={styles.input}
            value={radius}
            onChangeText={setRadius}
            keyboardType="numeric"
            placeholder="5000"
            placeholderTextColor={palette.gray400}
          />
        </Section>

        <Section title={t('expiresOnOptional')}>
          <Text style={styles.help}>YYYY-MM-DD</Text>
          <TextInput
            style={styles.input}
            value={expiresAt}
            onChangeText={setExpiresAt}
            placeholder="2026-12-31"
            placeholderTextColor={palette.gray400}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Section>

        <Section title={t('source')}>
          <TextInput
            style={styles.input}
            value={source}
            onChangeText={setSource}
            placeholder="Ministère de l'Intérieur, OMS…"
            placeholderTextColor={palette.gray400}
          />
        </Section>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>{t('alertActive')}</Text>
            <Text style={styles.toggleHelp}>{t('alertActiveHelp')}</Text>
          </View>
          <Switch
            value={active}
            onValueChange={setActive}
            trackColor={{ false: palette.gray200, true: palette.skyBlue }}
            thumbColor={active ? palette.mediterraneanBlue : palette.gray400}
          />
        </View>

        <TouchableOpacity
          style={[styles.submit, submitting && styles.submitDisabled]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={palette.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={palette.white} />
              <Text style={styles.submitText}>{t('save')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const LangField = ({ label, value, onChange, multiline, rtl }: any) => (
  <View style={styles.langRow}>
    <Text style={styles.langLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textarea, rtl && { textAlign: 'right' }]}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.h3, color: palette.gray900 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  section: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    color: palette.gray600,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  langRow: { marginBottom: spacing.xs },
  langLabel: {
    color: palette.terracotta,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  input: {
    backgroundColor: palette.gray50,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: palette.gray900,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  textarea: { minHeight: 80 },
  label: { color: palette.gray600, fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 4 },
  help: { color: palette.gray500, fontSize: 11, marginBottom: 6 },
  chipsRow: { flexDirection: 'row', gap: spacing.sm },
  chipsGrid: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipActive: { backgroundColor: palette.mediterraneanBlue, borderColor: palette.mediterraneanBlue },
  chipText: { color: palette.gray700, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: palette.white },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.gray200,
    marginBottom: spacing.lg,
  },
  toggleLabel: { color: palette.gray900, fontWeight: '600', fontSize: 14 },
  toggleHelp: { color: palette.gray500, fontSize: 12, marginTop: 2 },
  submit: {
    backgroundColor: palette.mediterraneanBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.md,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: palette.white, fontWeight: '700', fontSize: 16 },
});
