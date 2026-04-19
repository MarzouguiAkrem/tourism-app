import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { palette, spacing } from '../../theme';
import PlaceCard from '../../components/data-display/PlaceCard';
import { Place } from '../../types/place';
import { placesService } from '../../services/places.service';
import { HomeScreenProps } from '../../types/navigation';

export default function PlacesByCategoryScreen({
  route,
  navigation,
}: HomeScreenProps<'PlacesByCategory'>) {
  const { categoryId, categoryName } = route.params;
  const { t } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    placesService
      .list({ category: categoryId, limit: 50 })
      .then((res) => active && setPlaces(res.data))
      .catch((e) => active && setError(e?.message || t('error')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [categoryId, t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={palette.gray800} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {categoryName}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.mediterraneanBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: palette.white,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: palette.gray900, flex: 1 },
  list: { padding: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  errorText: { color: palette.error, fontSize: 14 },
  mutedText: { color: palette.gray500, fontSize: 14 },
});
