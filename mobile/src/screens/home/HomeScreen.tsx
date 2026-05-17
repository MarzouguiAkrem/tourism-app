import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows } from '../../theme';
import { useAppSelector } from '../../store/hooks';
import { Category, Place } from '../../types/place';
import { categoriesService } from '../../services/categories.service';
import { placesService } from '../../services/places.service';
import { resolveImageUrl } from '../../utils/imageUrl';
import PlaceCard from '../../components/data-display/PlaceCard';
import CategoryCircle from '../../components/data-display/CategoryCircle';
import CurrencyWidget from '../../components/data-display/CurrencyWidget';
import SearchBar from '../../components/common/SearchBar';
import { HomeScreenProps } from '../../types/navigation';
import { Image } from 'react-native';

const headerBanner = require('../../../assets/images/header.png');

export default function HomeScreen({ navigation }: HomeScreenProps<'HomeMain'>) {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);

  const [categories, setCategories] = useState<Category[]>([]);
  const [topRated, setTopRated] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cats, top] = await Promise.all([
        categoriesService.list(true),
        placesService.topRated(6),
      ]);
      setCategories(cats);
      setTopRated(top);
    } catch (e: any) {
      setError(e?.message || t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header banner with greeting overlay */}
        <ImageBackground
          source={headerBanner}
          style={styles.headerBanner}
          imageStyle={styles.headerBannerImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay}>
            <View style={styles.userBlock}>
              <View style={styles.avatarRing}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: resolveImageUrl(user.avatar) }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitials}>
                      {(user?.firstName?.[0] || '?').toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.welcomeMutedOnImage}>{t('welcome')}</Text>
                <Text style={styles.welcomeNameOnImage}>
                  {user?.firstName ? `Hi, ${user.firstName}` : t('appName')}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Hero question + search */}
        <View style={styles.heroBlock}>
          <Text style={styles.heroQuestion}>{t('heroQuestion')}</Text>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={() =>
              search.trim() &&
              navigation.navigate('PlacesByCategory', {
                categoryId: '',
                categoryName: search.trim(),
              })
            }
            placeholder={t('search')}
            onFilter={() => navigation.getParent()?.navigate('Explore')}
          />
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={palette.mediterraneanBlue} />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={palette.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={load} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Categories — horizontal circles */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {categories.map((cat) => (
                <CategoryCircle
                  key={cat._id}
                  category={cat}
                  onPress={() =>
                    navigation.navigate('PlacesByCategory', {
                      categoryId: cat._id,
                      categoryName: cat.name?.fr || cat.slug,
                    })
                  }
                />
              ))}
            </ScrollView>

            {/* Popular section */}
            <SectionHeader title={t('popular')} onViewAll={() => navigation.getParent()?.navigate('Explore')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {topRated.map((place) => (
                <PlaceCard
                  key={place._id}
                  place={place}
                  variant="compact"
                  onPress={() => navigation.navigate('PlaceDetail', { placeId: place._id })}
                />
              ))}
            </ScrollView>

            {/* New destinations — wide list of 3 */}
            <SectionHeader title={t('newDestinations')} />
            <View style={styles.wideList}>
              {topRated.slice(3, 6).map((p) => (
                <PlaceCard
                  key={`wide-${p._id}`}
                  place={p}
                  variant="wide"
                  onPress={() => navigation.navigate('PlaceDetail', { placeId: p._id })}
                />
              ))}
            </View>

            {/* Travel essentials tiles */}
            <SectionHeader title={t('travelEssentials')} />
            <View style={styles.tilesGrid}>
              <QuickTile icon="people" label={t('culture')} color={palette.terracotta}
                onPress={() => navigation.navigate('CulturalGuide')} />
              <QuickTile icon="shield-checkmark" label={t('safety')} color={palette.mediterraneanBlue}
                onPress={() => navigation.navigate('SafetyTips')} />
              <QuickTile icon="pricetag" label={t('prices')} color={palette.gold}
                onPress={() => navigation.navigate('Prices')} />
            </View>

            {/* Currency widget */}
            <SectionHeader title={t('exchangeRates')} />
            <CurrencyWidget onPress={() => navigation.navigate('CurrencyConverter')} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickTile({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.tileIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.tileLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.seeAll}>{t('seeAll')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  content: { paddingBottom: spacing['3xl'] },

  // ── Header ─────────────────────────────────────────────
  headerBanner: {
    width: '100%',
    height: 180,
    marginBottom: spacing.lg,
  },
  headerBannerImage: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeMutedOnImage: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  welcomeNameOnImage: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.white,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  userBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: palette.gray100,
    borderWidth: 2,
    borderColor: palette.white,
  },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: {
    backgroundColor: palette.mediterraneanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: palette.white, fontSize: 18, fontWeight: '700' },

  // ── Hero ───────────────────────────────────────────────
  heroBlock: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  heroQuestion: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.gray900,
    marginBottom: spacing.lg,
  },

  // ── Layout commons ─────────────────────────────────────
  loader: { paddingVertical: spacing['4xl'], alignItems: 'center' },
  errorBox: {
    margin: spacing.xl,
    padding: spacing.base,
    backgroundColor: palette.errorLight,
    borderRadius: 12,
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: { color: palette.error, fontSize: 13, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    backgroundColor: palette.error,
    borderRadius: 8,
  },
  retryText: { color: palette.white, fontWeight: '600', fontSize: 13 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.base,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: palette.gray900 },
  seeAll: { fontSize: 13, fontWeight: '600', color: palette.mediterraneanBlue },
  row: {
    paddingHorizontal: spacing.xl,
    gap: 0, // PlaceCard / CategoryCircle handle their own marginRight
  },

  wideList: { paddingHorizontal: spacing.xl },

  // ── Tiles ──────────────────────────────────────────────
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tile: {
    width: '48%',
    backgroundColor: palette.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { color: palette.gray800, fontWeight: '600', fontSize: 13, flex: 1 },
});
