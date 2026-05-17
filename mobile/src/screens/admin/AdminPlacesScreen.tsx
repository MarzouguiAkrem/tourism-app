import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { placesService } from '../../services/places.service';
import { Place } from '../../types/place';
import { useLocalized } from '../../hooks/useLocalized';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function AdminPlacesScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const fetchPlaces = useCallback(
    async (targetPage = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        const res = await placesService.list({
          page: targetPage,
          limit: 20,
          search: debouncedSearch || undefined,
          status: 'all',
        });
        setPlaces((prev) => (append ? [...prev, ...res.data] : res.data));
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
      } catch (err: any) {
        Alert.alert(t('error'), err?.response?.data?.message || t('error'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, t]
  );

  useEffect(() => {
    fetchPlaces(1, false);
  }, [fetchPlaces]);

  // Refresh when navigating back from the form
  useFocusEffect(
    useCallback(() => {
      fetchPlaces(1, false);
    }, [fetchPlaces])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaces(1, false);
  };

  const loadMore = () => {
    if (loading || page >= totalPages) return;
    fetchPlaces(page + 1, true);
  };

  const confirmDelete = (place: Place) => {
    Alert.alert(t('confirm'), t('deletePlaceConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            setBusyId(place._id);
            await placesService.remove(place._id);
            setPlaces((prev) => prev.filter((p) => p._id !== place._id));
            Alert.alert(t('saved'), t('placeDeleted'));
          } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('error'));
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('placeManagement')}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminPlaceForm', {})}
          hitSlop={10}
        >
          <Ionicons name="add-circle" size={26} color={palette.mediterraneanBlue} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={palette.gray400} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchPlace')}
          placeholderTextColor={palette.gray400}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={palette.gray400} />
          </TouchableOpacity>
        )}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.mediterraneanBlue}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('noPlacesFound')}</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.coverImage ? (
                <Image
                  source={{ uri: resolveImageUrl(item.coverImage) }}
                  style={styles.thumb}
                />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Ionicons name="image" size={18} color={palette.gray400} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {tr(item.name)}
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="location" size={11} color={palette.gray500} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.region}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'published'
                        ? styles.statusPublished
                        : item.status === 'draft'
                        ? styles.statusDraft
                        : styles.statusArchived,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{t(item.status)}</Text>
                  </View>
                </View>
              </View>

              {busyId === item._id ? (
                <ActivityIndicator color={palette.mediterraneanBlue} />
              ) : (
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('AdminPlaceForm', { placeId: item._id })
                    }
                    hitSlop={8}
                    style={[styles.iconBtn, styles.iconBtnEdit]}
                  >
                    <Ionicons name="create-outline" size={18} color={palette.mediterraneanBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(item)}
                    hitSlop={8}
                    style={[styles.iconBtn, styles.iconBtnDelete]}
                  >
                    <Ionicons name="trash-outline" size={18} color={palette.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.h3, color: palette.gray900 },
  searchWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  searchInput: { flex: 1, color: palette.gray900, fontSize: 14, paddingVertical: 0 },
  list: { padding: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing['3xl'] },
  empty: { textAlign: 'center', color: palette.gray500, marginTop: spacing.xl, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  thumb: { width: 50, height: 50, borderRadius: 10, backgroundColor: palette.gray100 },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  name: { color: palette.gray900, fontWeight: '700', fontSize: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { color: palette.gray500, fontSize: 11, textTransform: 'capitalize' },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: 6,
  },
  statusPublished: { backgroundColor: palette.successLight },
  statusDraft: { backgroundColor: palette.gray200 },
  statusArchived: { backgroundColor: palette.errorLight },
  statusPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, color: palette.gray800 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnEdit: { backgroundColor: palette.infoLight },
  iconBtnDelete: { backgroundColor: palette.errorLight },
});
