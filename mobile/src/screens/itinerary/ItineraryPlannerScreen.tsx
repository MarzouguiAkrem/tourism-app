import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { itinerariesService } from '../../services/itineraries.service';
import { GenerateItineraryPayload } from '../../types/itinerary';
import { PriceLevel } from '../../types/place';

const INTERESTS = [
  'history',
  'beach',
  'desert',
  'culture',
  'food',
  'adventure',
  'nature',
  'shopping',
  'nightlife',
  'architecture',
  'religious',
  'wellness',
] as const;

const REGIONS = [
  'tunis',
  'nord',
  'nord-ouest',
  'nord-est',
  'centre',
  'centre-ouest',
  'centre-est',
  'sud-ouest',
  'sud-est',
  'sud',
] as const;

const BUDGET_LEVELS: PriceLevel[] = ['budget', 'moderate', 'luxury'];

const TOTAL_STEPS = 4;

export default function ItineraryPlannerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [durationDays, setDurationDays] = useState(5);
  const [budgetLevel, setBudgetLevel] = useState<PriceLevel>('moderate');
  const [budget, setBudget] = useState<string>(''); // TND
  const [interests, setInterests] = useState<string[]>([]);
  const [startRegion, setStartRegion] = useState<string | null>(null);
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const toggleInterest = (k: string) =>
    setInterests((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const fetchLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('locationPermissionDenied'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setStartCoords([pos.coords.longitude, pos.coords.latitude]);
    } catch (err: any) {
      Alert.alert(t('error'), err?.message || t('error'));
    } finally {
      setLocating(false);
    }
  };

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canProceed = () => {
    if (step === 1) return durationDays >= 1 && durationDays <= 30;
    if (step === 2) return interests.length > 0;
    if (step === 3) return true; // start location optional
    return true;
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      const payload: GenerateItineraryPayload = {
        durationDays,
        budgetLevel,
        interests,
        persist: true,
        currency: 'TND',
      };
      if (budget) payload.budget = Number(budget);
      if (startRegion) payload.startRegion = startRegion;
      if (startCoords) payload.startCoords = startCoords;

      const { itinerary, warning } = await itinerariesService.generate(payload);
      if (warning) {
        Alert.alert(t('warning'), warning);
      }
      navigation.replace('ItineraryResult', { itineraryId: itinerary._id });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('error');
      Alert.alert(t('error'), msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('planYourTrip')}</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.progress}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressBar,
              i < step ? styles.progressBarActive : styles.progressBarInactive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepIndicator}>
        {t('stepOfN', { current: step, total: TOTAL_STEPS })}
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <Step1
            durationDays={durationDays}
            setDurationDays={setDurationDays}
            budgetLevel={budgetLevel}
            setBudgetLevel={setBudgetLevel}
            budget={budget}
            setBudget={setBudget}
          />
        )}
        {step === 2 && (
          <Step2 interests={interests} toggleInterest={toggleInterest} />
        )}
        {step === 3 && (
          <Step3
            startRegion={startRegion}
            setStartRegion={setStartRegion}
            startCoords={startCoords}
            fetchLocation={fetchLocation}
            locating={locating}
          />
        )}
        {step === 4 && (
          <Step4
            durationDays={durationDays}
            budgetLevel={budgetLevel}
            budget={budget}
            interests={interests}
            startRegion={startRegion}
            startCoords={startCoords}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity style={styles.btnSecondary} onPress={back} disabled={submitting}>
            <Text style={styles.btnSecondaryText}>{t('back')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {step < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[styles.btnPrimary, !canProceed() && styles.btnDisabled]}
            onPress={next}
            disabled={!canProceed()}
          >
            <Text style={styles.btnPrimaryText}>{t('next')}</Text>
            <Ionicons name="arrow-forward" size={18} color={palette.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnPrimary, submitting && styles.btnDisabled]}
            onPress={submit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={palette.white} />
                <Text style={styles.btnPrimaryText}>{t('generate')}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
// STEP 1 — Duration + Budget
// ──────────────────────────────────────────────────────────────
const Step1 = ({
  durationDays,
  setDurationDays,
  budgetLevel,
  setBudgetLevel,
  budget,
  setBudget,
}: any) => {
  const { t } = useTranslation();
  return (
    <View>
      <Text style={styles.sectionTitle}>{t('howManyDays')}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => setDurationDays(Math.max(1, durationDays - 1))}
        >
          <Ionicons name="remove" size={22} color={palette.mediterraneanBlue} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{durationDays}</Text>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => setDurationDays(Math.min(30, durationDays + 1))}
        >
          <Ionicons name="add" size={22} color={palette.mediterraneanBlue} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
        {t('budgetLevel')}
      </Text>
      <View style={styles.chipsRow}>
        {BUDGET_LEVELS.map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.chip, budgetLevel === lvl && styles.chipActive]}
            onPress={() => setBudgetLevel(lvl)}
          >
            <Text style={[styles.chipText, budgetLevel === lvl && styles.chipTextActive]}>
              {t(`budgetLevels.${lvl}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
        {t('budgetCapOptional')}
      </Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={budget}
          onChangeText={setBudget}
          placeholder={t('budgetPlaceholder')}
          placeholderTextColor={palette.gray400}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.inputSuffix}>TND</Text>
      </View>
    </View>
  );
};

// ──────────────────────────────────────────────────────────────
// STEP 2 — Interests
// ──────────────────────────────────────────────────────────────
const Step2 = ({
  interests,
  toggleInterest,
}: {
  interests: string[];
  toggleInterest: (k: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <Text style={styles.sectionTitle}>{t('yourInterests')}</Text>
      <Text style={styles.sectionHelper}>{t('selectAtLeastOne')}</Text>
      <View style={styles.chipsGrid}>
        {INTERESTS.map((k) => {
          const active = interests.includes(k);
          return (
            <TouchableOpacity
              key={k}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleInterest(k)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t(`interests.${k}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ──────────────────────────────────────────────────────────────
// STEP 3 — Start region / location
// ──────────────────────────────────────────────────────────────
const Step3 = ({
  startRegion,
  setStartRegion,
  startCoords,
  fetchLocation,
  locating,
}: any) => {
  const { t } = useTranslation();
  return (
    <View>
      <Text style={styles.sectionTitle}>{t('startRegion')}</Text>
      <Text style={styles.sectionHelper}>{t('startRegionHelper')}</Text>
      <View style={styles.chipsGrid}>
        <TouchableOpacity
          style={[styles.chip, !startRegion && styles.chipActive]}
          onPress={() => setStartRegion(null)}
        >
          <Text style={[styles.chipText, !startRegion && styles.chipTextActive]}>
            {t('anyRegion')}
          </Text>
        </TouchableOpacity>
        {REGIONS.map((r) => {
          const active = startRegion === r;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setStartRegion(active ? null : r)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t(`regions.${r}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
        {t('yourLocationOptional')}
      </Text>
      <Text style={styles.sectionHelper}>{t('locationHelper')}</Text>
      <TouchableOpacity
        style={styles.locationBtn}
        onPress={fetchLocation}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color={palette.mediterraneanBlue} />
        ) : (
          <>
            <Ionicons
              name={startCoords ? 'checkmark-circle' : 'locate'}
              size={22}
              color={startCoords ? palette.success : palette.mediterraneanBlue}
            />
            <Text style={styles.locationBtnText}>
              {startCoords ? t('locationCaptured') : t('useMyLocation')}
            </Text>
          </>
        )}
      </TouchableOpacity>
      {startCoords && (
        <Text style={styles.coordsText}>
          {startCoords[1].toFixed(4)}, {startCoords[0].toFixed(4)}
        </Text>
      )}
    </View>
  );
};

// ──────────────────────────────────────────────────────────────
// STEP 4 — Summary
// ──────────────────────────────────────────────────────────────
const Step4 = ({
  durationDays,
  budgetLevel,
  budget,
  interests,
  startRegion,
  startCoords,
}: any) => {
  const { t } = useTranslation();
  return (
    <View>
      <Text style={styles.sectionTitle}>{t('summary')}</Text>
      <Text style={styles.sectionHelper}>{t('reviewBeforeGenerate')}</Text>

      <View style={styles.summaryCard}>
        <SummaryRow icon="calendar-outline" label={t('duration')}>
          {t('daysCount', { count: durationDays })}
        </SummaryRow>
        <SummaryRow icon="wallet-outline" label={t('budgetLevel')}>
          {t(`budgetLevels.${budgetLevel}`)}
          {budget ? ` · ${budget} TND` : ''}
        </SummaryRow>
        <SummaryRow icon="heart-outline" label={t('interests.title')}>
          {interests.length > 0
            ? interests.map((i: string) => t(`interests.${i}`)).join(', ')
            : '—'}
        </SummaryRow>
        <SummaryRow icon="pin-outline" label={t('startRegion')}>
          {startRegion ? t(`regions.${startRegion}`) : t('anyRegion')}
        </SummaryRow>
        <SummaryRow icon="locate-outline" label={t('yourLocation')}>
          {startCoords ? `${startCoords[1].toFixed(4)}, ${startCoords[0].toFixed(4)}` : '—'}
        </SummaryRow>
      </View>
    </View>
  );
};

const SummaryRow = ({ icon, label, children }: any) => (
  <View style={styles.summaryRow}>
    <View style={styles.summaryRowLeft}>
      <Ionicons name={icon} size={18} color={palette.gray500} />
      <Text style={styles.summaryRowLabel}>{label}</Text>
    </View>
    <Text style={styles.summaryRowValue} numberOfLines={2}>
      {children}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.h4, color: palette.gray900 },
  progress: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  progressBar: { flex: 1, height: 4, borderRadius: 2 },
  progressBarActive: { backgroundColor: palette.mediterraneanBlue },
  progressBarInactive: { backgroundColor: palette.gray200 },
  stepIndicator: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    color: palette.gray500,
    fontSize: 12,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: { ...typography.h3, color: palette.gray900, marginBottom: spacing.xs },
  sectionHelper: { ...typography.bodySmall, color: palette.gray500, marginBottom: spacing.md },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  stepperValue: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.mediterraneanBlue,
    minWidth: 60,
    textAlign: 'center',
  },
  chipsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chipsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipActive: {
    backgroundColor: palette.mediterraneanBlue,
    borderColor: palette.mediterraneanBlue,
  },
  chipText: { color: palette.gray700, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: palette.white },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.gray200,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: 16,
    color: palette.gray900,
  },
  inputSuffix: { color: palette.gray500, fontWeight: '600' },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  locationBtnText: { color: palette.gray800, fontWeight: '600' },
  coordsText: { color: palette.gray500, fontSize: 12, marginTop: spacing.sm, marginLeft: spacing.sm },
  summaryCard: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray100,
  },
  summaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 140,
  },
  summaryRowLabel: { color: palette.gray600, fontWeight: '600', fontSize: 13 },
  summaryRowValue: { flex: 1, color: palette.gray900, fontSize: 14, textAlign: 'right' },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.gray200,
    backgroundColor: palette.white,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: palette.gray100,
  },
  btnSecondaryText: { color: palette.gray700, fontWeight: '600' },
  btnPrimary: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: palette.mediterraneanBlue,
  },
  btnPrimaryText: { color: palette.white, fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
