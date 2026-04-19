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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius } from '../../theme';
import PlaceCard from '../../components/data-display/PlaceCard';
import OSMMapView, { OSMMarker } from '../../components/map/OSMMapView';
import { Place, PlaceFilters, PriceLevel } from '../../types/place';
import { placesService } from '../../services/places.service';
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

export default function ExploreScreen({ navigation }: ExploreScreenProps<'ExploreMain'>) {
  const { t } = useTranslation();
  const tr = useLocalized();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [priceLevel, setPriceLevel] = useState<PriceLevel | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filters = useMemo<PlaceFilters>(
    () => ({
      ...(region ? { region } : {}),
      ...(priceLevel ? { priceLevel } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      limit: 50,
    }),
    [region, priceLevel, search]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await placesService.list(filters);
      setPlaces(res.data);
    } catch (e: any) {
      setError(e?.message || t('error'));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(load, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [load]);

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
        <TouchableOpacity
          onPress={() => setView(view === 'list' ? 'map' : 'list')}
          style={styles.viewToggle}
        >
          <Ionicons
            name={view === 'list' ? 'map' : 'list'}
            size={20}
            color={palette.mediterraneanBlue}
          />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
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
        <OSMMapView
          markers={places.map<OSMMarker>((p) => ({
            id: p._id,
            latitude: p.location.coordinates[1],
            longitude: p.location.coordinates[0],
            title: tr(p.name),
            subtitle: tr(p.shortDescription),
          }))}
          onMarkerPress={(id) => navigation.navigate('PlaceDetail', { placeId: id })}
        />
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
    </SafeAreaView>
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
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
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
  },
  chipActive: { backgroundColor: palette.mediterraneanBlue, borderColor: palette.mediterraneanBlue },
  chipLabel: { fontSize: 13, color: palette.gray700, fontWeight: '600', textTransform: 'capitalize' },
  chipLabelActive: { color: palette.white },
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
