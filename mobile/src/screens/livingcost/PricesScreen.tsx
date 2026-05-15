import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { livingCostsService } from '../../services/livingCosts.service';
import { LivingCost, LivingCostCategory } from '../../types/livingCost';
import { useLocalized } from '../../hooks/useLocalized';

const CATEGORIES: { key: LivingCostCategory | 'all'; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', icon: 'apps' },
  { key: 'food', icon: 'fast-food' },
  { key: 'transport', icon: 'car' },
  { key: 'accommodation', icon: 'bed' },
  { key: 'shopping', icon: 'bag-handle' },
  { key: 'leisure', icon: 'happy' },
  { key: 'communication', icon: 'cellular' },
];

export default function PricesScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();

  const [filter, setFilter] = useState<LivingCostCategory | 'all'>('all');
  const [items, setItems] = useState<LivingCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    livingCostsService
      .list(filter === 'all' ? undefined : filter)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const grouped = useMemo(() => {
    const map: Record<string, LivingCost[]> = {};
    items.forEach((it) => {
      if (!map[it.category]) map[it.category] = [];
      map[it.category].push(it);
    });
    return map;
  }, [items]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('prices')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {CATEGORIES.map((c) => {
          const active = filter === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setFilter(c.key)}
            >
              <Ionicons name={c.icon} size={14} color={active ? palette.white : palette.gray600} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t(`priceCategories.${c.key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={palette.mediterraneanBlue} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {Object.keys(grouped).length === 0 ? (
            <Text style={styles.empty}>{t('noResults')}</Text>
          ) : (
            Object.entries(grouped).map(([cat, list]) => (
              <View key={cat} style={styles.section}>
                <Text style={styles.sectionTitle}>{t(`priceCategories.${cat}` as any)}</Text>
                {list.map((it) => (
                  <View key={it._id} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{tr(it.item)}</Text>
                      {it.unit ? <Text style={styles.unit}>/ {it.unit}</Text> : null}
                      {it.note && tr(it.note) ? (
                        <Text style={styles.itemNote} numberOfLines={2}>
                          {tr(it.note)}
                        </Text>
                      ) : null}
                      {it.region ? (
                        <Text style={styles.itemRegion}>
                          {t(`regions.${it.region}` as any)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.priceCol}>
                      <Text style={styles.price}>{it.priceTND.toFixed(2)} TND</Text>
                      {it.priceRange?.min != null && it.priceRange?.max != null && (
                        <Text style={styles.range}>
                          {it.priceRange.min}—{it.priceRange.max}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
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
  tabsRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, gap: 6 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  tabActive: { backgroundColor: palette.mediterraneanBlue, borderColor: palette.mediterraneanBlue },
  tabText: { color: palette.gray700, fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: palette.white },
  list: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  empty: { textAlign: 'center', color: palette.gray500, marginTop: spacing.xl },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    color: palette.terracotta,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 6,
    ...shadows.sm,
  },
  itemName: { color: palette.gray900, fontSize: 14, fontWeight: '600' },
  unit: { color: palette.gray500, fontSize: 11 },
  itemNote: { color: palette.gray600, fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  itemRegion: { color: palette.terracotta, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  price: { color: palette.olive, fontWeight: '700', fontSize: 14 },
  range: { color: palette.gray500, fontSize: 11 },
});
