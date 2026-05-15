import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { placesService } from '../../services/places.service';
import { categoriesService } from '../../services/categories.service';
import { Place } from '../../types/place';
import PlaceCard from '../../components/data-display/PlaceCard';

// Tags we consider "heritage" — combined with category fallback below
const HERITAGE_TAGS = ['history', 'architecture', 'religious', 'culture'];

export default function HeritageScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [locating, setLocating] = useState(false);
  const [heritageCategoryId, setHeritageCategoryId] = useState<string | null>(null);

  // Resolve the Histoire & Patrimoine category id once
  useEffect(() => {
    categoriesService
      .list(true)
      .then((cats) => {
        const heritage = cats.find((c) => c.slug === 'histoire-patrimoine');
        if (heritage) setHeritageCategoryId(heritage._id);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(places.length === 0);
      if (nearbyMode) {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          setNearbyMode(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const data = await placesService.nearby({
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
          radius: 100000, // 100 km
          limit: 30,
          category: heritageCategoryId || undefined,
        });
        // Client-side keep only heritage by tag (if no category id resolved)
        const filtered = heritageCategoryId
          ? data
          : data.filter((p) => p.tags?.some((t) => HERITAGE_TAGS.includes(t)));
        setPlaces(filtered);
      } else {
        const res = await placesService.list({
          ...(heritageCategoryId ? { category: heritageCategoryId } : { tags: HERITAGE_TAGS }),
          sort: '-rating.average',
          limit: 50,
        });
        setPlaces(res.data);
      }
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [nearbyMode, heritageCategoryId, places.length, t]);

  useEffect(() => {
    load();
  }, [nearbyMode, heritageCategoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleNearby = async () => {
    if (nearbyMode) {
      setNearbyMode(false);
      return;
    }
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('locationPermissionDenied'));
        return;
      }
      setNearbyMode(true);
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('heritage')}</Text>
        <TouchableOpacity onPress={toggleNearby} hitSlop={10} disabled={locating}>
          {locating ? (
            <ActivityIndicator size="small" color={palette.mediterraneanBlue} />
          ) : (
            <Ionicons
              name={nearbyMode ? 'navigate' : 'navigate-outline'}
              size={22}
              color={nearbyMode ? palette.terracotta : palette.mediterraneanBlue}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.intro}>
        <Ionicons name="library" size={18} color={palette.terracotta} />
        <Text style={styles.introText}>
          {nearbyMode ? t('heritageNearMeIntro') : t('heritageAllIntro')}
        </Text>
      </View>

      {loading && places.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.mediterraneanBlue} />
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(p) => p._id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
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
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="library-outline" size={48} color={palette.gray400} />
              <Text style={styles.empty}>{t('noResults')}</Text>
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
    </View>
  );
}

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
  headerTitle: { ...typography.h3, color: palette.gray900 },
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: palette.terracotta + '12',
    borderRadius: borderRadius.md,
  },
  introText: { flex: 1, color: palette.gray700, fontSize: 12, lineHeight: 17 },
  centered: { alignItems: 'center', marginTop: spacing['2xl'], gap: spacing.sm },
  empty: { color: palette.gray500, fontSize: 14 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },
});
