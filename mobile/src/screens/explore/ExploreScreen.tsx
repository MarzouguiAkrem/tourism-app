import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import { palette, spacing, borderRadius, shadows } from '../../theme';
import PlaceCard from '../../components/data-display/PlaceCard';
import OSMMapView, { OSMMarker, OSMMapHandle, UserLocation } from '../../components/map/OSMMapView';
import { AccommodationType, Category, Place, PlaceFilters, PriceLevel } from '../../types/place';
import { placesService } from '../../services/places.service';
import { categoriesService } from '../../services/categories.service';
import { useLocalized } from '../../hooks/useLocalized';
import { ExploreScreenProps } from '../../types/navigation';

const REGIONS: { value: string; label: string }[] = [
  { value: 'tunis', label: 'Tunis' },
  { value: 'nord', label: 'Nord' },
  { value: 'nord-est', label: 'Nord-Est' },
  { value: 'nord-ouest', label: 'Nord-Ouest' },
  { value: 'centre', label: 'Centre' },
  { value: 'centre-est', label: 'Centre-Est' },
  { value: 'centre-ouest', label: 'Centre-Ouest' },
  { value: 'sud', label: 'Sud' },
  { value: 'sud-est', label: 'Sud-Est' },
  { value: 'sud-ouest', label: 'Sud-Ouest' },
];

const PRICES: { value: PriceLevel; label: string }[] = [
  { value: 'budget', label: '$' },
  { value: 'moderate', label: '$$' },
  { value: 'luxury', label: '$$$' },
];

const ACCOMMODATION_TYPES: AccommodationType[] = [
  'hotel',
  'hostel',
  'riad',
  'guesthouse',
  'apartment',
  'resort',
  'camping',
  'ecolodge',
];

// ─── Helpers (declared before the screen so Hermes resolves them on first
//     render — hoisting can be flaky with function declarations following an
//     export default). ────────────────────────────────────────────────────
function SectionLabel({
  icon,
  label,
  top,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  top?: boolean;
}) {
  return (
    <View style={[styles.sectionLabelRow, top && styles.sectionLabelTop]}>
      <Ionicons name={icon} size={14} color={palette.mediterraneanBlue} />
      <Text style={styles.modalSection}>{label}</Text>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CategoryChip({
  category,
  active,
  onPress,
}: {
  category: Category;
  active: boolean;
  onPress: () => void;
}) {
  const tr = useLocalized();
  const color = category.color || palette.mediterraneanBlue;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.categoryChip,
        active
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: `${color}15`, borderColor: `${color}33` },
      ]}
    >
      <Ionicons
        name={(category.icon as keyof typeof Ionicons.glyphMap) || 'pricetag-outline'}
        size={14}
        color={active ? palette.white : color}
      />
      <Text
        style={[
          styles.categoryChipLabel,
          { color: active ? palette.white : palette.gray800 },
        ]}
      >
        {tr(category.name)}
      </Text>
    </TouchableOpacity>
  );
}

export default function ExploreScreen({ navigation }: ExploreScreenProps<'ExploreMain'>) {
  const { t } = useTranslation();
  const tr = useLocalized();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [priceLevel, setPriceLevel] = useState<PriceLevel | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accommodationType, setAccommodationType] = useState<AccommodationType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User geolocation
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(5000); // meters
  const [locating, setLocating] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const mapRef = useRef<OSMMapHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories once for the filter modal
  useEffect(() => {
    categoriesService
      .list(true)
      .then(setCategories)
      .catch(() => {});
  }, []);

  const filters = useMemo<PlaceFilters>(
    () => ({
      ...(region ? { region } : {}),
      ...(priceLevel ? { priceLevel } : {}),
      ...(categoryId ? { category: categoryId } : {}),
      ...(accommodationType ? { accommodationType } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      limit: 50,
    }),
    [region, priceLevel, categoryId, accommodationType, search]
  );

  const activeFilterCount =
    (region ? 1 : 0) +
    (priceLevel ? 1 : 0) +
    (categoryId ? 1 : 0) +
    (accommodationType ? 1 : 0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (nearbyMode && userLocation) {
        const res = await placesService.nearby({
          longitude: userLocation.longitude,
          latitude: userLocation.latitude,
          radius: nearbyRadius,
          limit: 50,
          category: categoryId || undefined,
        });
        // Client-side enforce other filters that /nearby doesn't accept
        const filtered = res.filter((p) => {
          if (region && p.region !== region) return false;
          if (priceLevel && p.priceLevel !== priceLevel) return false;
          if (accommodationType && p.accommodationType !== accommodationType) return false;
          if (search.trim()) {
            const q = search.trim().toLowerCase();
            const names = [p.name?.fr, p.name?.en, p.name?.ar]
              .filter(Boolean)
              .map((s) => s.toLowerCase());
            if (!names.some((n) => n.includes(q))) return false;
          }
          return true;
        });
        setPlaces(filtered);
      } else {
        const res = await placesService.list(filters);
        setPlaces(res.data);
      }
    } catch (e: any) {
      setError(e?.message || t('error'));
    } finally {
      setLoading(false);
    }
  }, [filters, nearbyMode, nearbyRadius, userLocation, region, priceLevel, accommodationType, categoryId, search, t]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(load, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [load]);

  const requestLocation = async (): Promise<UserLocation | null> => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('locationPermissionDenied'));
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const loc: UserLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? undefined,
      };
      setUserLocation(loc);
      return loc;
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || t('error'));
      return null;
    } finally {
      setLocating(false);
    }
  };

  const centerOnMe = async () => {
    let loc = userLocation;
    if (!loc) {
      loc = await requestLocation();
    }
    if (loc) {
      if (view !== 'map') setView('map');
      setTimeout(() => mapRef.current?.centerOn(loc!.latitude, loc!.longitude, 14), 200);
    }
  };

  const toggleNearby = async () => {
    if (nearbyMode) {
      setNearbyMode(false);
      return;
    }
    let loc = userLocation;
    if (!loc) {
      loc = await requestLocation();
    }
    if (loc) setNearbyMode(true);
  };

  const resetFilters = () => {
    setRegion(null);
    setPriceLevel(null);
    setCategoryId(null);
    setAccommodationType(null);
  };

  const toggleChip = <T,>(value: T, current: T | null, setter: (v: T | null) => void) => {
    setter(current === value ? null : value);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={palette.gray500} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          placeholderTextColor={palette.gray400}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={palette.gray400} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setFiltersOpen(true)} style={styles.viewToggle}>
          <Ionicons name="funnel-outline" size={18} color={palette.mediterraneanBlue} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setView(view === 'list' ? 'map' : 'list')}
          style={styles.viewToggle}
        >
          <Ionicons
            name={view === 'list' ? 'map-outline' : 'list-outline'}
            size={18}
            color={palette.mediterraneanBlue}
          />
        </TouchableOpacity>
      </View>

      {/* Quick actions: nearby + region/price chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <TouchableOpacity
          onPress={toggleNearby}
          activeOpacity={0.85}
          style={[styles.chip, styles.chipLeading, nearbyMode && styles.chipActive]}
        >
          {locating && !userLocation ? (
            <ActivityIndicator size="small" color={nearbyMode ? palette.white : palette.mediterraneanBlue} />
          ) : (
            <Ionicons
              name={nearbyMode ? 'navigate' : 'navigate-outline'}
              size={14}
              color={nearbyMode ? palette.white : palette.mediterraneanBlue}
            />
          )}
          <Text style={[styles.chipLabel, nearbyMode && styles.chipLabelActive]}>
            {t('nearby')}
          </Text>
        </TouchableOpacity>

        <View style={styles.chipDivider} />

        {REGIONS.map((r) => (
          <Chip
            key={r.value}
            label={r.label}
            active={region === r.value}
            onPress={() => toggleChip(r.value, region, setRegion)}
          />
        ))}
        <View style={styles.chipDivider} />
        {PRICES.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            active={priceLevel === p.value}
            onPress={() => toggleChip(p.value, priceLevel, setPriceLevel)}
          />
        ))}
      </ScrollView>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.mediterraneanBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : view === 'map' ? (
        <View style={{ flex: 1 }}>
          <OSMMapView
            ref={mapRef}
            markers={places.map<OSMMarker>((p) => ({
              id: p._id,
              latitude: p.location.coordinates[1],
              longitude: p.location.coordinates[0],
              title: tr(p.name),
              subtitle: tr(p.shortDescription),
            }))}
            userLocation={userLocation}
            onMarkerPress={(id) => navigation.navigate('PlaceDetail', { placeId: id })}
          />
          <TouchableOpacity
            onPress={centerOnMe}
            style={styles.fab}
            activeOpacity={0.85}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color={palette.mediterraneanBlue} />
            ) : (
              <Ionicons
                name={userLocation ? 'locate' : 'locate-outline'}
                size={22}
                color={palette.mediterraneanBlue}
              />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(p) => p._id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.mutedText}>{t('noResults')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              onPress={() => navigation.navigate('PlaceDetail', { placeId: item._id })}
            />
          )}
        />
      )}

      {/* Filters modal */}
      <Modal
        visible={filtersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('filters')}</Text>
              <TouchableOpacity onPress={() => setFiltersOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={palette.gray700} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
              {/* Category */}
              <SectionLabel icon="grid-outline" label={t('categories')} />
              <View style={styles.modalChipGrid}>
                <Chip
                  label={t('roleAll')}
                  active={!categoryId}
                  onPress={() => setCategoryId(null)}
                />
                {categories.map((c) => (
                  <CategoryChip
                    key={c._id}
                    category={c}
                    active={categoryId === c._id}
                    onPress={() => setCategoryId(categoryId === c._id ? null : c._id)}
                  />
                ))}
              </View>

              {/* Region */}
              <SectionLabel icon="pin-outline" label={t('regionLabel')} top />
              <View style={styles.modalChipGrid}>
                <Chip
                  label={t('roleAll')}
                  active={!region}
                  onPress={() => setRegion(null)}
                />
                {REGIONS.map((r) => (
                  <Chip
                    key={r.value}
                    label={r.label}
                    active={region === r.value}
                    onPress={() => setRegion(region === r.value ? null : r.value)}
                  />
                ))}
              </View>

              {/* Price level */}
              <SectionLabel icon="cash-outline" label={t('priceLevel')} top />
              <View style={styles.modalChipGrid}>
                <Chip
                  label={t('roleAll')}
                  active={!priceLevel}
                  onPress={() => setPriceLevel(null)}
                />
                {PRICES.map((p) => (
                  <Chip
                    key={p.value}
                    label={p.label}
                    active={priceLevel === p.value}
                    onPress={() =>
                      setPriceLevel(priceLevel === p.value ? null : p.value)
                    }
                  />
                ))}
              </View>

              {/* Accommodation */}
              <SectionLabel icon="bed-outline" label={t('accommodationType')} top />
              <View style={styles.modalChipGrid}>
                <Chip
                  label={t('noPreference')}
                  active={!accommodationType}
                  onPress={() => setAccommodationType(null)}
                />
                {ACCOMMODATION_TYPES.map((at) => (
                  <Chip
                    key={at}
                    label={t(`accommodationTypes.${at}`)}
                    active={accommodationType === at}
                    onPress={() =>
                      setAccommodationType(accommodationType === at ? null : at)
                    }
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalReset} onPress={resetFilters}>
                <Ionicons name="refresh-outline" size={16} color={palette.gray700} />
                <Text style={styles.modalResetText}>{t('clear')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApply}
                onPress={() => setFiltersOpen(false)}
              >
                <Ionicons name="checkmark" size={18} color={palette.white} />
                <Text style={styles.modalApplyText}>{t('done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: palette.gray900,
  },
  viewToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray100,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.terracotta,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: palette.white, fontSize: 10, fontWeight: '800' },
  chipsRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chipDivider: {
    width: 1,
    height: 20,
    backgroundColor: palette.gray300,
    marginHorizontal: 4,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
    flexShrink: 0,
  },
  chipLeading: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipActive: { backgroundColor: palette.mediterraneanBlue, borderColor: palette.mediterraneanBlue },
  chipLabel: { fontSize: 13, color: palette.gray700, fontWeight: '600' },
  chipLabelActive: { color: palette.white },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  categoryChipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: palette.gray900 },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  sectionLabelTop: { marginTop: spacing.lg },
  modalSection: {
    color: palette.gray600,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalChipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: palette.gray100,
  },
  modalReset: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: palette.gray100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalResetText: { color: palette.gray700, fontWeight: '700' },
  modalApply: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: palette.mediterraneanBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalApplyText: { color: palette.white, fontWeight: '700' },
  list: { padding: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  errorText: { color: palette.error, fontSize: 14 },
  mutedText: { color: palette.gray500, fontSize: 14 },
  retryBtn: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    backgroundColor: palette.error,
    borderRadius: 8,
  },
  retryText: { color: palette.white, fontWeight: '600', fontSize: 13 },
});
