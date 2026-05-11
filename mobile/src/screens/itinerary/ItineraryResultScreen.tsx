import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import OSMMapView, { OSMMarker, OSMPolyline } from '../../components/map/OSMMapView';
import { itinerariesService } from '../../services/itineraries.service';
import { Itinerary, ItineraryDay, ItineraryStop } from '../../types/itinerary';
import { Place } from '../../types/place';
import { useLocalized } from '../../hooks/useLocalized';
import { resolveImageUrl } from '../../utils/imageUrl';

type ParamList = { ItineraryResult: { itineraryId: string } };

const isPopulated = (p: ItineraryStop['place']): p is Place =>
  typeof p === 'object' && p !== null && 'location' in p;

export default function ItineraryResultScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'ItineraryResult'>>();
  const { itineraryId } = route.params;

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const fetchOne = useCallback(async () => {
    try {
      setLoading(true);
      const it = await itinerariesService.getOne(itineraryId);
      setItinerary(it);
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itineraryId, navigation, t]);

  useEffect(() => {
    fetchOne();
  }, [fetchOne]);

  const moveStop = (dayIdx: number, stopIdx: number, dir: -1 | 1) => {
    if (!itinerary) return;
    const next = JSON.parse(JSON.stringify(itinerary)) as Itinerary;
    const stops = next.days[dayIdx].stops;
    const target = stopIdx + dir;
    if (target < 0 || target >= stops.length) return;
    [stops[stopIdx], stops[target]] = [stops[target], stops[stopIdx]];
    stops.forEach((s, i) => (s.order = i + 1));
    setItinerary(next);
  };

  const removeStop = (dayIdx: number, stopIdx: number) => {
    if (!itinerary) return;
    const next = JSON.parse(JSON.stringify(itinerary)) as Itinerary;
    const day = next.days[dayIdx];
    const removed = day.stops.splice(stopIdx, 1)[0];
    day.estimatedCost = Math.max(0, day.estimatedCost - (removed?.estimatedCost || 0));
    day.stops.forEach((s, i) => (s.order = i + 1));
    next.totalCost = next.days.reduce((s, d) => s + d.estimatedCost, 0);
    setItinerary(next);
  };

  const save = async () => {
    if (!itinerary) return;
    try {
      setSaving(true);
      const patch = {
        days: itinerary.days.map((d) => ({
          ...d,
          stops: d.stops.map((s) => ({
            ...s,
            place: isPopulated(s.place) ? s.place._id : s.place,
          })),
        })),
        totalCost: itinerary.totalCost,
        status: 'active' as const,
      };
      const updated = await itinerariesService.update(itinerary._id, patch as any);
      setItinerary(updated);
      Alert.alert(t('saved'), t('itinerarySaved'));
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setSaving(false);
    }
  };

  const day = itinerary?.days?.[activeDay];

  const { markers, polyline } = useMemo<{ markers: OSMMarker[]; polyline?: OSMPolyline }>(() => {
    if (!day) return { markers: [] };
    const populated = day.stops.filter((s) => isPopulated(s.place)) as Array<
      ItineraryStop & { place: Place }
    >;
    const m: OSMMarker[] = populated.map((s) => ({
      id: s.place._id,
      latitude: s.place.location.coordinates[1],
      longitude: s.place.location.coordinates[0],
      title: tr(s.place.name),
      subtitle: s.place.region,
      label: s.order,
    }));
    const coords = populated.map(
      (s) => [s.place.location.coordinates[1], s.place.location.coordinates[0]] as [number, number]
    );
    return { markers: m, polyline: coords.length > 1 ? { coordinates: coords } : undefined };
  }, [day, tr]);

  if (loading || !itinerary) {
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {itinerary.title}
        </Text>
        <TouchableOpacity onPress={save} hitSlop={10} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={palette.mediterraneanBlue} />
          ) : (
            <Ionicons name="save-outline" size={22} color={palette.mediterraneanBlue} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.metaBar}>
        <MetaItem icon="calendar-outline" value={t('daysCount', { count: itinerary.durationDays })} />
        <MetaItem
          icon="wallet-outline"
          value={`${itinerary.totalCost.toFixed(0)} ${itinerary.currency}`}
          color={palette.olive}
        />
        <MetaItem
          icon="sparkles-outline"
          value={t(`budgetLevels.${itinerary.budgetLevel}`)}
          color={palette.gold}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {itinerary.days.map((d, idx) => {
          const active = idx === activeDay;
          return (
            <TouchableOpacity
              key={d.dayNumber}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveDay(idx)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t('dayN', { n: d.dayNumber })}
              </Text>
              <Text style={[styles.tabSub, active && styles.tabSubActive]}>
                {d.stops.length} {t('stopsShort')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.mapWrap}>
        <OSMMapView markers={markers} polyline={polyline} />
      </View>

      <ScrollView
        style={styles.stopsList}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
      >
        {day && day.stops.length === 0 ? (
          <Text style={styles.emptyDay}>{t('noStopsThisDay')}</Text>
        ) : (
          day?.stops.map((stop, idx) => (
            <StopCard
              key={`${stop.order}-${idx}`}
              stop={stop}
              isFirst={idx === 0}
              isLast={idx === day.stops.length - 1}
              onMoveUp={() => moveStop(activeDay, idx, -1)}
              onMoveDown={() => moveStop(activeDay, idx, 1)}
              onRemove={() => removeStop(activeDay, idx)}
              onPress={() => {
                if (isPopulated(stop.place)) {
                  navigation.navigate('Explore', {
                    screen: 'PlaceDetail',
                    params: { placeId: stop.place._id },
                  });
                }
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const MetaItem = ({ icon, value, color }: any) => (
  <View style={styles.metaItem}>
    <Ionicons name={icon} size={16} color={color || palette.gray600} />
    <Text style={[styles.metaItemText, color && { color }]}>{value}</Text>
  </View>
);

const StopCard = ({
  stop,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  onPress,
}: {
  stop: ItineraryStop;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onPress: () => void;
}) => {
  const tr = useLocalized();
  const place = isPopulated(stop.place) ? stop.place : null;
  const name = place ? tr(place.name) : '—';
  const cover = place ? resolveImageUrl(place.coverImage) : null;
  const region = place ? place.region : '';

  return (
    <View style={styles.stopCard}>
      <View style={styles.stopOrder}>
        <Text style={styles.stopOrderText}>{stop.order}</Text>
      </View>
      <TouchableOpacity style={styles.stopBody} onPress={onPress} activeOpacity={0.85}>
        {cover && <Image source={{ uri: cover }} style={styles.stopImage} />}
        <View style={styles.stopMeta}>
          <Text style={styles.stopName} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.stopMetaRow}>
            <Ionicons name="time-outline" size={12} color={palette.gray500} />
            <Text style={styles.stopMetaText}>{stop.durationMin}m</Text>
            <Text style={styles.dot}>·</Text>
            <Ionicons name="wallet-outline" size={12} color={palette.gray500} />
            <Text style={styles.stopMetaText}>{stop.estimatedCost} TND</Text>
            {region ? (
              <>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.stopMetaText}>{region}</Text>
              </>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.stopActions}>
        <TouchableOpacity onPress={onMoveUp} disabled={isFirst} hitSlop={6}>
          <Ionicons
            name="chevron-up"
            size={20}
            color={isFirst ? palette.gray300 : palette.gray600}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMoveDown} disabled={isLast} hitSlop={6}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={isLast ? palette.gray300 : palette.gray600}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} hitSlop={6}>
          <Ionicons name="trash-outline" size={18} color={palette.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: { ...typography.h4, color: palette.gray900, flex: 1 },
  metaBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.lg,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaItemText: { color: palette.gray700, fontWeight: '600', fontSize: 13 },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    backgroundColor: palette.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.gray200,
    alignItems: 'center',
    minWidth: 80,
  },
  tabActive: {
    backgroundColor: palette.mediterraneanBlue,
    borderColor: palette.mediterraneanBlue,
  },
  tabText: { color: palette.gray700, fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: palette.white },
  tabSub: { color: palette.gray500, fontSize: 11, marginTop: 2 },
  tabSubActive: { color: palette.lightBlue },
  mapWrap: { height: 220, marginHorizontal: spacing.lg, borderRadius: borderRadius.lg, overflow: 'hidden' },
  stopsList: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  emptyDay: { textAlign: 'center', color: palette.gray500, marginTop: spacing.xl },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  stopOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.mediterraneanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopOrderText: { color: palette.white, fontWeight: '700', fontSize: 13 },
  stopBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stopImage: { width: 48, height: 48, borderRadius: borderRadius.md, backgroundColor: palette.gray200 },
  stopMeta: { flex: 1 },
  stopName: { color: palette.gray900, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  stopMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stopMetaText: { color: palette.gray500, fontSize: 12 },
  dot: { color: palette.gray300 },
  stopActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
