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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { placesService, PlacePayload } from '../../services/places.service';
import { categoriesService } from '../../services/categories.service';
import { AdminStackParamList } from '../../types/navigation';
import { Category, PlaceStatus, PriceLevel } from '../../types/place';
import { useLocalized } from '../../hooks/useLocalized';

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
];
const PRICE_LEVELS: PriceLevel[] = ['budget', 'moderate', 'luxury'];
const STATUSES: PlaceStatus[] = ['draft', 'published', 'archived'];

type Route = RouteProp<AdminStackParamList, 'AdminPlaceForm'>;

export default function AdminPlaceFormScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const placeId = route.params?.placeId;
  const isEdit = !!placeId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [nameFr, setNameFr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [shortFr, setShortFr] = useState('');
  const [shortEn, setShortEn] = useState('');
  const [shortAr, setShortAr] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [priceLevel, setPriceLevel] = useState<PriceLevel>('moderate');
  const [status, setStatus] = useState<PlaceStatus>('draft');
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const cats = await categoriesService.list(true);
        setCategories(cats);
        if (!isEdit && cats[0]) setCategoryId(cats[0]._id);
      } catch {
        // ignore
      }
    })();
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const p = await placesService.getOne(placeId!);
        setNameFr(p.name.fr || '');
        setNameEn(p.name.en || '');
        setNameAr(p.name.ar || '');
        setShortFr(p.shortDescription?.fr || '');
        setShortEn(p.shortDescription?.en || '');
        setShortAr(p.shortDescription?.ar || '');
        setCategoryId(typeof p.category === 'string' ? p.category : p.category._id);
        setRegion(p.region);
        setAddress(p.address || '');
        setLng(String(p.location.coordinates[0]));
        setLat(String(p.location.coordinates[1]));
        setPriceLevel(p.priceLevel || 'moderate');
        setStatus(p.status);
        setCoverImage(p.coverImage || '');
      } catch (err: any) {
        Alert.alert(t('error'), err?.response?.data?.message || t('error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, placeId, t]);

  const onSubmit = async () => {
    if (!nameFr.trim() || !nameEn.trim() || !nameAr.trim()) {
      Alert.alert(t('error'), t('nameRequiredAllLangs'));
      return;
    }
    if (!categoryId) {
      Alert.alert(t('error'), t('categoryRequired'));
      return;
    }
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (Number.isNaN(latN) || Number.isNaN(lngN) || latN < -90 || latN > 90 || lngN < -180 || lngN > 180) {
      Alert.alert(t('error'), t('invalidCoordinates'));
      return;
    }

    const payload: PlacePayload = {
      name: { fr: nameFr.trim(), en: nameEn.trim(), ar: nameAr.trim() },
      shortDescription: {
        fr: shortFr.trim(),
        en: shortEn.trim(),
        ar: shortAr.trim(),
      },
      category: categoryId,
      region,
      address: address.trim(),
      location: { type: 'Point', coordinates: [lngN, latN] },
      priceLevel,
      status,
      coverImage: coverImage.trim() || null,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await placesService.update(placeId!, payload);
        Alert.alert(t('saved'), t('placeUpdated'));
      } else {
        await placesService.create(payload);
        Alert.alert(t('saved'), t('placeCreated'));
      }
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={palette.gray700} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? t('editPlace') : t('addPlace')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Section title={t('name')}>
            <LabeledInput label="Français *" value={nameFr} onChangeText={setNameFr} />
            <LabeledInput label="English *" value={nameEn} onChangeText={setNameEn} />
            <LabeledInput label="العربية *" value={nameAr} onChangeText={setNameAr} />
          </Section>

          <Section title={t('shortDescription')}>
            <LabeledInput
              label="Français"
              value={shortFr}
              onChangeText={setShortFr}
              multiline
            />
            <LabeledInput
              label="English"
              value={shortEn}
              onChangeText={setShortEn}
              multiline
            />
            <LabeledInput
              label="العربية"
              value={shortAr}
              onChangeText={setShortAr}
              multiline
            />
          </Section>

          <Section title={t('category')}>
            <Chips
              options={categories.map((c) => ({ value: c._id, label: tr(c.name) }))}
              value={categoryId}
              onChange={setCategoryId}
            />
          </Section>

          <Section title={t('region')}>
            <Chips
              options={REGIONS.map((r) => ({ value: r, label: r }))}
              value={region}
              onChange={setRegion}
            />
          </Section>

          <Section title={t('location')}>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <LabeledInput
                  label={t('latitude')}
                  value={lat}
                  onChangeText={setLat}
                  keyboardType="numeric"
                  placeholder="34.0"
                />
              </View>
              <View style={{ flex: 1 }}>
                <LabeledInput
                  label={t('longitude')}
                  value={lng}
                  onChangeText={setLng}
                  keyboardType="numeric"
                  placeholder="9.0"
                />
              </View>
            </View>
            <LabeledInput label={t('address')} value={address} onChangeText={setAddress} />
          </Section>

          <Section title={t('priceLevel')}>
            <Chips
              options={PRICE_LEVELS.map((p) => ({ value: p, label: t(p) }))}
              value={priceLevel}
              onChange={(v) => setPriceLevel(v as PriceLevel)}
            />
          </Section>

          <Section title={t('status')}>
            <Chips
              options={STATUSES.map((s) => ({ value: s, label: t(s) }))}
              value={status}
              onChange={(v) => setStatus(v as PlaceStatus)}
            />
          </Section>

          <Section title={t('coverImage')}>
            <LabeledInput
              label="URL"
              value={coverImage}
              onChangeText={setCoverImage}
              placeholder="https://..."
              autoCapitalize="none"
            />
          </Section>

          <TouchableOpacity
            onPress={onSubmit}
            disabled={saving}
            style={[styles.submitBtn, saving && { opacity: 0.6 }]}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <>
                <Ionicons
                  name={isEdit ? 'save' : 'add-circle'}
                  size={18}
                  color={palette.white}
                />
                <Text style={styles.submitText}>
                  {isEdit ? t('save') : t('create')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const LabeledInput = ({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) => (
  <View style={styles.inputBlock}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, props.multiline && styles.inputMultiline]}
      placeholderTextColor={palette.gray400}
      {...props}
    />
  </View>
);

const Chips = ({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <View style={styles.chipsRow}>
    {options.map((o) => {
      const active = o.value === value;
      return (
        <TouchableOpacity
          key={o.value}
          onPress={() => onChange(o.value)}
          style={[styles.chip, active && styles.chipActive]}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

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
  headerTitle: { ...typography.h3, color: palette.gray900 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.h4,
    color: palette.gray800,
    marginBottom: spacing.xs,
  },
  sectionBody: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  inputBlock: { marginBottom: spacing.sm },
  inputLabel: {
    color: palette.gray600,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: palette.gray50,
    borderWidth: 1,
    borderColor: palette.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: palette.gray900,
    fontSize: 14,
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', gap: spacing.sm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipActive: {
    backgroundColor: palette.mediterraneanBlue,
    borderColor: palette.mediterraneanBlue,
  },
  chipText: {
    color: palette.gray700,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipTextActive: { color: palette.white },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: palette.mediterraneanBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  submitText: { color: palette.white, fontWeight: '800', fontSize: 15 },
});
