import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { adminService, RecommendationWeights } from '../../services/admin.service';

const KEYS: (keyof RecommendationWeights)[] = [
  'interestMatch',
  'rating',
  'proximityStart',
  'popularity',
];

export default function RecommendationConfigScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [weights, setWeights] = useState<RecommendationWeights>({
    interestMatch: 0.4,
    rating: 0.3,
    proximityStart: 0.2,
    popularity: 0.1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService
      .getRecommendationConfig()
      .then((cfg) => setWeights(cfg.weights))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sum = KEYS.reduce((s, k) => s + (weights[k] || 0), 0);
  const valid = Math.abs(sum - 1) <= 0.01;

  const adjust = (k: keyof RecommendationWeights, delta: number) => {
    setWeights((prev) => ({
      ...prev,
      [k]: Math.max(0, Math.min(1, Math.round((prev[k] + delta) * 100) / 100)),
    }));
  };

  const reset = () =>
    setWeights({ interestMatch: 0.4, rating: 0.3, proximityStart: 0.2, popularity: 0.1 });

  const save = async () => {
    if (!valid) {
      Alert.alert(t('error'), t('weightsSumError'));
      return;
    }
    try {
      setSaving(true);
      await adminService.updateRecommendationConfig(weights);
      Alert.alert(t('saved'), t('recommendationSaved'));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
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
        <Text style={styles.headerTitle}>{t('recommendationConfig')}</Text>
        <TouchableOpacity onPress={reset} hitSlop={10}>
          <Ionicons name="refresh" size={22} color={palette.gray700} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.intro}>
          <Ionicons name="information-circle" size={18} color={palette.info} />
          <Text style={styles.introText}>{t('recommendationIntro')}</Text>
        </View>

        {KEYS.map((k) => {
          const value = weights[k] || 0;
          return (
            <View key={k} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{t(`weights.${k}`)}</Text>
                <Text style={styles.cardValue}>{(value * 100).toFixed(0)}%</Text>
              </View>
              <Text style={styles.cardHelp}>{t(`weightsHelp.${k}`)}</Text>
              <View style={styles.controls}>
                <TouchableOpacity style={styles.ctrlBtn} onPress={() => adjust(k, -0.05)}>
                  <Ionicons name="remove" size={20} color={palette.mediterraneanBlue} />
                </TouchableOpacity>
                <View style={styles.barWrap}>
                  <View style={[styles.barFill, { width: `${value * 100}%` }]} />
                </View>
                <TouchableOpacity style={styles.ctrlBtn} onPress={() => adjust(k, 0.05)}>
                  <Ionicons name="add" size={20} color={palette.mediterraneanBlue} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={[styles.sumBox, !valid && styles.sumBoxBad]}>
          <Text style={styles.sumLabel}>{t('weightsTotal')}</Text>
          <Text style={[styles.sumValue, !valid && styles.sumValueBad]}>
            {(sum * 100).toFixed(0)}%
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, (!valid || saving) && styles.saveBtnDisabled]}
          onPress={save}
          disabled={!valid || saving}
        >
          {saving ? (
            <ActivityIndicator color={palette.white} />
          ) : (
            <>
              <Ionicons name="save" size={18} color={palette.white} />
              <Text style={styles.saveBtnText}>{t('save')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.h4, color: palette.gray900 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: palette.infoLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  introText: { flex: 1, color: palette.info, fontSize: 13, lineHeight: 18 },
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.h4, color: palette.gray800, fontSize: 15 },
  cardValue: { color: palette.mediterraneanBlue, fontWeight: '800', fontSize: 18 },
  cardHelp: { color: palette.gray500, fontSize: 12, marginTop: 4, marginBottom: spacing.sm },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barWrap: { flex: 1, height: 8, backgroundColor: palette.gray100, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: palette.mediterraneanBlue, borderRadius: 4 },
  sumBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  sumBoxBad: { backgroundColor: palette.errorLight },
  sumLabel: { color: palette.gray700, fontWeight: '600' },
  sumValue: { color: palette.success, fontWeight: '800', fontSize: 20 },
  sumValueBad: { color: palette.error },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.mediterraneanBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: palette.white, fontWeight: '700', fontSize: 16 },
});
