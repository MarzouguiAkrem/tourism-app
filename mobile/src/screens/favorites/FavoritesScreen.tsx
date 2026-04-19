import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing } from '../../theme';
import PlaceCard from '../../components/data-display/PlaceCard';
import { Place } from '../../types/place';
import { favoritesService } from '../../services/favorites.service';
import { useAppSelector } from '../../store/hooks';
import { FavoritesScreenProps } from '../../types/navigation';

export default function FavoritesScreen({ navigation }: FavoritesScreenProps<'FavoritesList'>) {
  const { t } = useTranslation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  // re-fetch when the cached favorite-id set changes (e.g. user toggled from a card)
  const idsKey = useAppSelector((s) => s.favorites.ids.length);

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const res = await favoritesService.list(1, 50);
      setPlaces(res.data);
    } catch (e: any) {
      setError(e?.message || t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    load();
  }, [load, idsKey]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={48} color={palette.gray400} />
          <Text style={styles.emptyTitle}>Connectez-vous</Text>
          <Text style={styles.emptyText}>
            Connectez-vous pour retrouver vos lieux favoris
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('favorites')}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.mediterraneanBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : places.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={48} color={palette.gray400} />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>
            Touchez le cœur sur un lieu pour l'ajouter ici
          </Text>
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
            />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 22, fontWeight: '700', color: palette.mediterraneanBlue },
  list: { padding: spacing.xl },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: palette.gray700, marginTop: spacing.sm },
  emptyText: { fontSize: 14, color: palette.gray500, textAlign: 'center' },
  errorText: { color: palette.error, fontSize: 14 },
});
