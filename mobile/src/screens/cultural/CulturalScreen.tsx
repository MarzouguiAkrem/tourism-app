import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { culturalService } from '../../services/cultural.service';
import { CulturalContent, CulturalType } from '../../types/cultural';
import { useLocalized } from '../../hooks/useLocalized';
import { resolveImageUrl } from '../../utils/imageUrl';

const TYPES: { key: CulturalType | 'all'; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', icon: 'apps' },
  { key: 'custom', icon: 'people' },
  { key: 'etiquette', icon: 'hand-right' },
  { key: 'tradition', icon: 'sparkles' },
  { key: 'cuisine', icon: 'restaurant' },
];

export default function CulturalScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();

  const [filter, setFilter] = useState<CulturalType | 'all'>('all');
  const [items, setItems] = useState<CulturalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(items.length === 0);
      const data = await culturalService.list(filter === 'all' ? undefined : filter);
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, items.length]);

  useEffect(() => {
    load();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('culture')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {TYPES.map((it) => {
          const active = filter === it.key;
          return (
            <TouchableOpacity
              key={it.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setFilter(it.key)}
            >
              <Ionicons name={it.icon} size={16} color={active ? palette.white : palette.gray600} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t(`culturalTypes.${it.key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={palette.mediterraneanBlue} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
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
          {items.length === 0 ? (
            <Text style={styles.empty}>{t('noResults')}</Text>
          ) : (
            items.map((c) => (
              <View key={c._id} style={styles.card}>
                {c.image && (
                  <Image source={{ uri: resolveImageUrl(c.image) }} style={styles.cardImage} />
                )}
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardType}>{t(`culturalTypes.${c.type}`)}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{tr(c.title)}</Text>
                  {c.summary && (
                    <Text style={styles.cardSummary} numberOfLines={3}>
                      {tr(c.summary)}
                    </Text>
                  )}
                  {c.content && (
                    <Text style={styles.cardContent}>{tr(c.content)}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
  tabsRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  tabActive: { backgroundColor: palette.mediterraneanBlue, borderColor: palette.mediterraneanBlue },
  tabText: { color: palette.gray700, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: palette.white },
  list: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  empty: { textAlign: 'center', color: palette.gray500, marginTop: spacing.xl },
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardImage: { width: '100%', height: 160, backgroundColor: palette.gray200 },
  cardBody: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  cardType: {
    color: palette.terracotta,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: { ...typography.h4, color: palette.gray900, marginBottom: spacing.xs },
  cardSummary: { ...typography.bodySmall, color: palette.gray600, marginBottom: spacing.sm },
  cardContent: { ...typography.bodySmall, color: palette.gray700, lineHeight: 22 },
});
