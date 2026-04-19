import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { palette, spacing } from '../../theme';
import { useAppSelector } from '../../store/hooks';
import { Category, Place } from '../../types/place';
import { categoriesService } from '../../services/categories.service';
import { placesService } from '../../services/places.service';
import PlaceCard from '../../components/data-display/PlaceCard';
import CategoryCard from '../../components/data-display/CategoryCard';
import { HomeScreenProps } from '../../types/navigation';

export default function HomeScreen({ navigation }: HomeScreenProps<'HomeMain'>) {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);

  const [categories, setCategories] = useState<Category[]>([]);
  const [topRated, setTopRated] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cats, top] = await Promise.all([
        categoriesService.list(true),
        placesService.topRated(8),
      ]);
      setCategories(cats);
      setTopRated(top);
    } catch (e: any) {
      console.log('[Home] load error', e?.message);
      setError(e?.message || t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              {user?.firstName ? t('welcomeBack', { name: user.firstName }) : t('welcome')}
            </Text>
            <Text style={styles.subtitle}>Découvrez la Tunisie</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search" size={22} color={palette.gray700} />
          </TouchableOpacity>
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
            {/* Categories */}
            <SectionHeader title={t('categories')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {categories.map((cat) => (
                <CategoryCard
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

            {/* Top rated */}
            <SectionHeader title={t('featured')} />
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, action }: { title: string; action?: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action}>
          <Text style={styles.seeAll}>{t('seeAll')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  content: { paddingBottom: spacing['3xl'] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.base,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: palette.mediterraneanBlue },
  subtitle: { fontSize: 13, color: palette.gray500, marginTop: 2 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: palette.gray900 },
  seeAll: { fontSize: 13, fontWeight: '600', color: palette.mediterraneanBlue },
  row: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
});
