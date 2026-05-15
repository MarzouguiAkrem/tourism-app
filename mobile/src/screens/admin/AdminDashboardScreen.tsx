import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import {
  adminService,
  OverviewStats,
  UserGrowthStats,
  PopularPlacesStats,
  RegionStats,
} from '../../services/admin.service';
import { useLocalized } from '../../hooks/useLocalized';

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [growth, setGrowth] = useState<UserGrowthStats | null>(null);
  const [popular, setPopular] = useState<PopularPlacesStats | null>(null);
  const [regions, setRegions] = useState<RegionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [o, g, p, r] = await Promise.all([
        adminService.overview(),
        adminService.userGrowth(30),
        adminService.popularPlaces(5),
        adminService.regions(),
      ]);
      setOverview(o);
      setGrowth(g);
      setPopular(p);
      setRegions(r);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !overview) {
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
        <Text style={styles.headerTitle}>{t('adminDashboard')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('AdminUsers')} hitSlop={10}>
            <Ionicons name="people" size={22} color={palette.mediterraneanBlue} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AdminAlerts')} hitSlop={10}>
            <Ionicons name="warning" size={22} color={palette.mediterraneanBlue} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AdminFeedbackList')} hitSlop={10}>
            <Ionicons name="chatbox-ellipses" size={22} color={palette.mediterraneanBlue} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('RecommendationConfig')} hitSlop={10}>
            <Ionicons name="options" size={22} color={palette.mediterraneanBlue} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={palette.mediterraneanBlue}
          />
        }
      >
        {/* Overview cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label={t('users')}
            value={overview?.users.total ?? 0}
            sub={`${overview?.users.active ?? 0} ${t('active').toLowerCase()}`}
            icon="people"
            color={palette.mediterraneanBlue}
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <StatCard
            label={t('placesLabel')}
            value={overview?.places.total ?? 0}
            sub={`${overview?.places.published ?? 0} ${t('publishedShort')}`}
            icon="location"
            color={palette.terracotta}
            onPress={() =>
              navigation.getParent()?.navigate('Main', { screen: 'Explore' })
            }
          />
          <StatCard
            label={t('reviews')}
            value={overview?.reviews.total ?? 0}
            sub={`${overview?.reviews.pending ?? 0} ${t('pending').toLowerCase()}`}
            icon="star"
            color={palette.gold}
            onPress={() => navigation.navigate('AdminFeedbackList')}
          />
          <StatCard
            label={t('itineraries')}
            value={overview?.itineraries.total ?? 0}
            sub={`${overview?.itineraries.generated ?? 0} ${t('auto').toLowerCase()}`}
            icon="map"
            color={palette.olive}
          />
          <StatCard
            label={t('favorites')}
            value={overview?.favorites ?? 0}
            icon="heart"
            color={palette.error}
          />
          <StatCard
            label={t('activeAlerts')}
            value={overview?.safety.activeAlerts ?? 0}
            icon="shield-checkmark"
            color={palette.info}
            onPress={() => navigation.navigate('AdminAlerts')}
          />
        </View>

        {/* Growth */}
        <Section title={t('userGrowth30d')}>
          <View style={styles.growthRow}>
            <View style={styles.growthBox}>
              <Text style={styles.growthValue}>{growth?.last7Days ?? 0}</Text>
              <Text style={styles.growthLabel}>{t('last7Days')}</Text>
            </View>
            <View style={styles.growthBox}>
              <Text style={styles.growthValue}>{growth?.lastNDays ?? 0}</Text>
              <Text style={styles.growthLabel}>{t('last30Days')}</Text>
            </View>
          </View>
        </Section>

        {/* Popular */}
        <Section title={t('mostFavorited')}>
          {popular?.byFavorites.length === 0 ? (
            <Text style={styles.empty}>—</Text>
          ) : (
            popular?.byFavorites.map((p, idx) => (
              <TouchableOpacity
                key={p.place._id}
                style={styles.row}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.getParent()?.navigate('Main', {
                    screen: 'Explore',
                    params: {
                      screen: 'PlaceDetail',
                      params: { placeId: p.place._id },
                    },
                  })
                }
              >
                <Text style={styles.rank}>#{idx + 1}</Text>
                <Text style={styles.rowName} numberOfLines={1}>
                  {tr(p.place.name)}
                </Text>
                <View style={styles.countPill}>
                  <Ionicons name="heart" size={12} color={palette.error} />
                  <Text style={styles.countText}>{p.favoriteCount}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={palette.gray400} />
              </TouchableOpacity>
            ))
          )}
        </Section>

        {/* Region distribution */}
        <Section title={t('placesByRegion')}>
          {regions?.placesByRegion.slice(0, 8).map((r) => (
            <View key={r.region} style={styles.barRow}>
              <Text style={styles.barLabel}>{r.region}</Text>
              <View style={styles.barWrap}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(
                        100,
                        (r.count /
                          Math.max(
                            ...(regions?.placesByRegion.map((x) => x.count) || [1])
                          )) *
                          100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barCount}>{r.count}</Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </View>
  );
}

const StatCard = ({ label, value, sub, icon, color, onPress }: any) => {
  const content = (
    <>
      <View style={styles.statTopRow}>
        <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={14} color={palette.gray400} />
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </>
  );
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.statCard, { borderTopColor: color }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>{content}</View>
  );
};

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
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
  headerActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    width: '48%',
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderTopWidth: 3,
    ...shadows.sm,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: palette.gray900 },
  statLabel: { color: palette.gray600, fontSize: 12, fontWeight: '600', marginTop: 2 },
  statSub: { color: palette.gray400, fontSize: 11, marginTop: 2 },
  section: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h4, color: palette.gray800, marginBottom: spacing.sm },
  sectionBody: { backgroundColor: palette.white, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.sm },
  empty: { color: palette.gray500, fontSize: 13 },
  growthRow: { flexDirection: 'row', gap: spacing.md },
  growthBox: { flex: 1, alignItems: 'center' },
  growthValue: { fontSize: 32, fontWeight: '800', color: palette.mediterraneanBlue },
  growthLabel: { color: palette.gray500, fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  rank: { color: palette.gray400, fontWeight: '700', width: 28 },
  rowName: { flex: 1, color: palette.gray800, fontSize: 14 },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countText: { color: palette.error, fontWeight: '700', fontSize: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  barLabel: { color: palette.gray700, fontSize: 12, width: 90, textTransform: 'capitalize' },
  barWrap: { flex: 1, height: 6, backgroundColor: palette.gray100, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: palette.mediterraneanBlue, borderRadius: 3 },
  barCount: { color: palette.gray700, fontSize: 12, fontWeight: '700', width: 30, textAlign: 'right' },
});
